resource "cloudflare_record" "terraform_managed_resource_1a1d4900a7d1aa5d92ff98115d8e52dc" {
  name    = "www"
  proxied = true
  ttl     = 1
  type    = "A"
  value   = "150.95.255.38"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_2da870b57f1362131b4ec8cb72422336" {
  name    = "casaparo-potal.com"
  proxied = true
  ttl     = 1
  type    = "CNAME"
  value   = "casaparo.pages.dev"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_836c336a52495c5eca66820e02ef546a" {
  name    = "pages"
  proxied = true
  ttl     = 1
  type    = "CNAME"
  value   = "casaparo.pages.dev"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_cbb46e1bfdbd60747ae97210a914c271" {
  name     = "casaparo-potal.com"
  priority = 0
  proxied  = false
  ttl      = 1
  type     = "MX"
  value    = "."
  zone_id  = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_f8792d495621bc6154bd3f0fd31e618b" {
  name     = "www"
  priority = 0
  proxied  = false
  ttl      = 1
  type     = "MX"
  value    = "."
  zone_id  = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_071b35644dfb98522021937900829658" {
  name    = "aws"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_5f9357bf7892c4f0ace41172b0f595d7" {
  name    = "aws"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_f85b1eb71af19d9b730940b027046420" {
  name    = "dev"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_e44d9719ff8d7d54badb1c93d47db829" {
  name    = "dev"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_8b4b3afcf03010b5a8958310f8e5cf20" {
  name    = "_dmarc"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_d3231f17e5fadb9aca4570b3927b61eb" {
  name    = "_dmarc"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_9408b50ddc3115bb5de41ba361eead39" {
  name    = "_domainkey"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_42b10610db5e2392e45e1200803551cd" {
  name    = "_domainkey"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_e2bc2aad850d4b6e5855da10e4281266" {
  name    = "e"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_db3ae5c3099112b5d7d3f59369b43a15" {
  name    = "e"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_9626296d652cf97da3ff86629e55de5e" {
  name    = "email"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_b0d7cf587d111e7a6ff8a11198bf6596" {
  name    = "email"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_b323513487b4419075210d0bae390362" {
  name    = "info"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_bdba2fa8971987884ed473ae141a8e3a" {
  name    = "info"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_587a3f163609a558ee2f2dc1d2034b89" {
  name    = "k8s"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_fde72a25e54f1894546b271aa88883b3" {
  name    = "k8s"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_20d95b0bc8b0af251ac958d386761fcb" {
  name    = "mail"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_ea21adc5c73bdff6843e4da053ad57dd" {
  name    = "mail"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_b3a462e8074a3206369e2b8f617bf3f8" {
  name    = "news"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_e9473ceba7131a2cf02100fda887682b" {
  name    = "news"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_98917c9965e1e5f17d93187666fdac6d" {
  name    = "newsletter"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_23eadb44c2d65762d1e4e29d1a753515" {
  name    = "newsletter"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_6e02a5dcd0f85217a0e867ff3a85c683" {
  name    = "ns1"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_b065e2165aa35a29c398d1a94bfdf3ce" {
  name    = "ns1"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_91dbf6ab92dd5d308bb1b3874d228849" {
  name    = "ns2"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_9f90155fac0fc20e67f002b5f41454f5" {
  name    = "ns2"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_cb8c58820ca4259442e7cc56c0764467" {
  name    = "spf"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_a9f247dbb5b8e30515ace5bb605edb5f" {
  name    = "spf"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_d8327fc197d55ed68946a740c0198e11" {
  name    = "test"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_3e9f679cd23d86c254864572318fb914" {
  name    = "test"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_48974a0eeac2a871ba7f8148bd74da2b" {
  name    = "track"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_31b341de2fd76bb2c6e7452d2a0a2520" {
  name    = "track"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_851fd81e6d1e57d0047721366cc273c9" {
  name    = "www"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns2.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_edcfa40dcb8467bb57fbda3d4bcbcb5e" {
  name    = "www"
  proxied = false
  ttl     = 1
  type    = "NS"
  value   = "dns1.onamae.com"
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_a3e0ba7768c12ee1a6ec8e8fccd6dd12" {
  name    = "casaparo-potal.com"
  proxied = false
  ttl     = 1
  type    = "TXT"
  value   = "\"v=spf1 -all\""
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

resource "cloudflare_record" "terraform_managed_resource_96a44c4f6e6607b09c9ad367b0f78d76" {
  name    = "www"
  proxied = false
  ttl     = 1
  type    = "TXT"
  value   = "\"v=spf1 -all\""
  zone_id = "30eb1a808252fde0a774e7f77d761076"
}

