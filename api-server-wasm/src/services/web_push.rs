//! Web Push sender for the Workers runtime.
//!
//! Implements the two specs a push service expects:
//!   * RFC 8291 - "aes128gcm" payload encryption (ECDH P-256 + HKDF-SHA256 + AES-128-GCM)
//!   * RFC 8292 - VAPID, an ES256 JWT identifying this application server
//!
//! Randomness comes from the runtime's `crypto.getRandomValues` rather than
//! `getrandom`, which has no wasm32-unknown-unknown backend.

use crate::domain::entities::web_push_subscription::WebPushSubscription;
use crate::worker_error;

use aes_gcm::aead::Aead;
use aes_gcm::{Aes128Gcm, KeyInit, Nonce};
use base64::engine::general_purpose::{STANDARD_NO_PAD, URL_SAFE_NO_PAD};
use base64::Engine;
use hkdf::Hkdf;
use p256::ecdh::diffie_hellman;
use p256::ecdsa::signature::Signer;
use p256::ecdsa::{Signature, SigningKey};
use p256::elliptic_curve::sec1::ToEncodedPoint;
use p256::{PublicKey, SecretKey};
use serde_json::json;
use sha2::Sha256;

use worker::js_sys::{global, Function, Reflect, Uint8Array};
use worker::wasm_bindgen::{JsCast, JsValue};
use worker::{Date, Env, Fetch, Headers, Method, Request, RequestInit, Result, Url};

/// Record size advertised in the aes128gcm header. A single record is always
/// sent, so the payload has to fit in one: `rs - 16 (auth tag) - 1 (delimiter)`.
const RECORD_SIZE: u32 = 4096;
const MAX_PAYLOAD_LEN: usize = RECORD_SIZE as usize - 17;
/// How long the push service keeps the message while the device is offline.
const TTL_SECONDS: u32 = 86_400;
/// VAPID tokens must not be valid for more than 24h; half of that is plenty.
const JWT_EXPIRATION_SECONDS: u64 = 12 * 60 * 60;

/// VAPID credentials shared by every notification this worker sends.
#[derive(Clone, Debug)]
pub struct VapidConfig {
    /// Base64url encoded uncompressed P-256 point (65 bytes), sent as `k=`.
    public_key: String,
    /// Base64url encoded raw P-256 scalar (32 bytes).
    private_key: String,
    /// `mailto:` or `https:` URI identifying the sender.
    subject: String,
}

impl VapidConfig {
    /// Reads the credentials from secrets, falling back to plain vars. Returns
    /// `None` when any of them is missing so that a misconfigured deployment
    /// only breaks broadcasting instead of every route.
    pub fn from_env(env: &Env) -> Option<Self> {
        let read = |name: &str| -> Option<String> {
            env.secret(name)
                .map(|secret| secret.to_string())
                .or_else(|_| env.var(name).map(|var| var.to_string()))
                .ok()
                .filter(|value| !value.is_empty())
        };
        Some(Self {
            public_key: read("VAPID_PUBLIC_KEY")?,
            private_key: read("VAPID_PRIVATE_KEY")?,
            // Push services reject a token without a contactable `sub`, so a
            // placeholder default would only turn this into a runtime 403.
            subject: read("VAPID_SUBJECT")?,
        })
    }

    /// Builds the `Authorization: vapid t=..., k=...` header for one endpoint.
    fn authorization_header(&self, endpoint: &Url) -> Result<String> {
        let audience = endpoint.origin().ascii_serialization();
        let header = URL_SAFE_NO_PAD.encode(br#"{"typ":"JWT","alg":"ES256"}"#);
        let claims = json!({
            "aud": audience,
            "exp": Date::now().as_millis() / 1000 + JWT_EXPIRATION_SECONDS,
            "sub": self.subject,
        });
        let claims = URL_SAFE_NO_PAD.encode(claims.to_string());
        let signing_input = format!("{}.{}", header, claims);

        let private_key = decode_base64(&self.private_key)?;
        let signing_key = match SigningKey::from_slice(&private_key) {
            Ok(signing_key) => signing_key,
            Err(e) => return worker_error!(format!("Invalid VAPID private key: {}", e)),
        };
        let signature: Signature = signing_key.sign(signing_input.as_bytes());

        Ok(format!(
            "vapid t={}.{}, k={}",
            signing_input,
            URL_SAFE_NO_PAD.encode(signature.to_bytes()),
            URL_SAFE_NO_PAD.encode(decode_base64(&self.public_key)?)
        ))
    }
}

/// What the push service answered for a single delivery attempt.
pub struct PushResponse {
    pub status_code: u16,
    /// Diagnostics from the push service; empty on success.
    pub body: String,
}

/// Delivers one already serialized JSON payload to a single subscription.
pub async fn send_notification(
    vapid: &VapidConfig,
    subscription: &WebPushSubscription,
    payload: &str,
) -> Result<PushResponse> {
    let endpoint = match Url::parse(&subscription.endpoint) {
        Ok(endpoint) => endpoint,
        Err(e) => return worker_error!(format!("Invalid push endpoint: {}", e)),
    };

    let body = encrypt(
        &decode_base64(&subscription.p256h_key)?,
        &decode_base64(&subscription.auth_key)?,
        payload.as_bytes(),
    )?;

    let mut headers = Headers::new();
    headers.set("Authorization", &vapid.authorization_header(&endpoint)?)?;
    headers.set("Content-Encoding", "aes128gcm")?;
    headers.set("Content-Type", "application/octet-stream")?;
    headers.set("TTL", &TTL_SECONDS.to_string())?;
    headers.set("Urgency", "normal")?;

    let mut init = RequestInit::new();
    init.with_method(Method::Post)
        .with_headers(headers)
        .with_body(Some(JsValue::from(Uint8Array::from(body.as_slice()))));

    let request = Request::new_with_init(endpoint.as_str(), &init)?;
    let mut response = Fetch::Request(request).send().await?;
    let status_code = response.status_code();
    let body = match (200..300).contains(&status_code) {
        true => String::new(),
        // Push services explain rejections (bad VAPID token, payload too large,
        // ...) in the body, which is otherwise impossible to diagnose remotely.
        false => response.text().await.unwrap_or_default().chars().take(200).collect(),
    };
    Ok(PushResponse { status_code, body })
}

/// RFC 8291 aes128gcm encryption of `plaintext` for one subscription.
///
/// `ua_public` is the subscriber's raw P-256 public key (`p256dh`) and `auth`
/// its 16 byte authentication secret.
fn encrypt(ua_public: &[u8], auth: &[u8], plaintext: &[u8]) -> Result<Vec<u8>> {
    encrypt_record(
        ua_public,
        auth,
        plaintext,
        &random_bytes(16)?,
        &generate_ephemeral_key()?,
    )
}

/// The deterministic half of [`encrypt`]: everything except drawing the salt
/// and the ephemeral key pair, which is what makes it testable against the
/// RFC 8291 test vector.
fn encrypt_record(
    ua_public: &[u8],
    auth: &[u8],
    plaintext: &[u8],
    salt: &[u8],
    as_secret_key: &SecretKey,
) -> Result<Vec<u8>> {
    if plaintext.len() > MAX_PAYLOAD_LEN {
        return worker_error!(format!(
            "Payload is too large: {} bytes (max {})",
            plaintext.len(),
            MAX_PAYLOAD_LEN
        ));
    }

    let ua_public_key = match PublicKey::from_sec1_bytes(ua_public) {
        Ok(ua_public_key) => ua_public_key,
        Err(e) => return worker_error!(format!("Invalid subscription p256dh key: {}", e)),
    };
    let ua_public_point = ua_public_key.to_encoded_point(false);

    let as_public_point = as_secret_key.public_key().to_encoded_point(false);

    let shared_secret = diffie_hellman(
        as_secret_key.to_nonzero_scalar(),
        ua_public_key.as_affine(),
    );

    // IKM = HKDF(salt: auth_secret, ikm: ecdh_secret, info: "WebPush: info\0" || ua_public || as_public)
    let mut info = Vec::with_capacity(14 + ua_public_point.len() + as_public_point.len());
    info.extend_from_slice(b"WebPush: info\0");
    info.extend_from_slice(ua_public_point.as_bytes());
    info.extend_from_slice(as_public_point.as_bytes());

    let mut ikm = [0u8; 32];
    expand(
        &Hkdf::<Sha256>::new(Some(auth), shared_secret.raw_secret_bytes()),
        &info,
        &mut ikm,
    )?;

    let hkdf = Hkdf::<Sha256>::new(Some(salt), &ikm);
    let mut content_encryption_key = [0u8; 16];
    expand(
        &hkdf,
        b"Content-Encoding: aes128gcm\0",
        &mut content_encryption_key,
    )?;
    let mut nonce = [0u8; 12];
    expand(&hkdf, b"Content-Encoding: nonce\0", &mut nonce)?;

    // Single record, so the padding delimiter is 0x02 ("last record").
    let mut record = Vec::with_capacity(plaintext.len() + 1);
    record.extend_from_slice(plaintext);
    record.push(0x02);

    let cipher = match Aes128Gcm::new_from_slice(&content_encryption_key) {
        Ok(cipher) => cipher,
        Err(e) => return worker_error!(format!("Failed to build the AES-GCM cipher: {}", e)),
    };
    let ciphertext = match cipher.encrypt(Nonce::from_slice(&nonce), record.as_slice()) {
        Ok(ciphertext) => ciphertext,
        Err(e) => return worker_error!(format!("Failed to encrypt the payload: {}", e)),
    };

    // aes128gcm header: salt(16) || rs(4) || idlen(1) || keyid(idlen) || ciphertext
    let mut body = Vec::with_capacity(21 + as_public_point.len() + ciphertext.len());
    body.extend_from_slice(salt);
    body.extend_from_slice(&RECORD_SIZE.to_be_bytes());
    body.push(as_public_point.len() as u8);
    body.extend_from_slice(as_public_point.as_bytes());
    body.extend_from_slice(&ciphertext);
    Ok(body)
}

fn expand(hkdf: &Hkdf<Sha256>, info: &[u8], okm: &mut [u8]) -> Result<()> {
    match hkdf.expand(info, okm) {
        Ok(_) => Ok(()),
        Err(e) => worker_error!(format!("Failed to derive a key: {}", e)),
    }
}

fn generate_ephemeral_key() -> Result<SecretKey> {
    // 32 random bytes are only rejected when they do not reduce to a valid
    // scalar, which is vanishingly unlikely; a couple of retries is enough.
    for _ in 0..4 {
        if let Ok(secret_key) = SecretKey::from_slice(&random_bytes(32)?) {
            return Ok(secret_key);
        }
    }
    worker_error!("Failed to generate an ephemeral key pair")
}

/// `crypto.getRandomValues` from the Workers global scope.
fn random_bytes(len: usize) -> Result<Vec<u8>> {
    let crypto = match Reflect::get(&global(), &JsValue::from_str("crypto")) {
        Ok(crypto) if !crypto.is_undefined() && !crypto.is_null() => crypto,
        _ => return worker_error!("crypto is unavailable in this runtime"),
    };
    let get_random_values = match Reflect::get(&crypto, &JsValue::from_str("getRandomValues"))
        .map(|value| value.dyn_into::<Function>())
    {
        Ok(Ok(get_random_values)) => get_random_values,
        _ => return worker_error!("crypto.getRandomValues is unavailable in this runtime"),
    };

    let buffer = Uint8Array::new_with_length(len as u32);
    if get_random_values.call1(&crypto, &buffer).is_err() {
        return worker_error!("crypto.getRandomValues failed");
    }
    Ok(buffer.to_vec())
}

/// Decodes base64 in either alphabet, with or without padding. The browser
/// hands us standard base64 for the subscription keys while VAPID keys are
/// conventionally base64url.
fn decode_base64(input: &str) -> Result<Vec<u8>> {
    let normalized: String = input
        .trim()
        .chars()
        .filter(|c| *c != '=' && !c.is_whitespace())
        .map(|c| match c {
            '-' => '+',
            '_' => '/',
            other => other,
        })
        .collect();
    match STANDARD_NO_PAD.decode(normalized) {
        Ok(decoded) => Ok(decoded),
        Err(e) => worker_error!(format!("Failed to decode a base64 value: {}", e)),
    }
}
