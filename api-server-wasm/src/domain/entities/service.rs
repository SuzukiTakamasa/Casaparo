use serde::{Deserialize, Serialize};
use worker::{Result, Response};

#[derive(Serialize, Deserialize, Debug)]
pub struct LatestVersion {
    pub version: u32
}

#[derive(Copy, Clone, Serialize, Deserialize, Debug)]
pub enum Status {
    Ok = 200,
    Created = 201,
    BadRequest = 400,
    InternalServerError = 500,
    Forbidden = 403,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct JSONResponse<T> {
    pub status: Status,
    pub message: String,
    pub data: Option<T>,
}

impl <T: Serialize>JSONResponse<T> {
    pub fn new(status: Status, error_message: Option<String>, data: Option<T> ) -> Result<Response> {
    let message = match status {
        Status::Ok => "OK".to_string(),
        Status::Created => "Created".to_string(),
        Status::BadRequest => "Bad Request".to_string(),
        Status::InternalServerError => format!("Internal Server Error: {}", error_message.unwrap_or("".to_string())),
        Status::Forbidden => "Forbidden".to_string(),
    };
    let response = JSONResponse {
        status,
        message,
        data,
    };
    return Response::from_json(&response).map(|resp| resp.with_status(status as u16));
    }
}