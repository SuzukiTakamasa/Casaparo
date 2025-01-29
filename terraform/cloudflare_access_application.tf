resource "cloudflare_access_application" "terraform_managed_resource_c7529019-365a-4d6a-8e3c-e9eaa3b5edec" {
  account_id                 = "e0f1db5d1481215971b3e68bd43688cc"
  allowed_idps               = ["03c00d67-602f-4f1a-86b8-665f0e1b3c1f", "28720b88-5ece-49d4-9c4d-38d3215d0250"]
  app_launcher_visible       = true
  auto_redirect_to_identity  = false
  domain                     = "*.casaparo.pages.dev"
  enable_binding_cookie      = false
  http_only_cookie_attribute = true
  name                       = "Casaparo Dev"
  session_duration           = "24h"
  type                       = "self_hosted"
}

resource "cloudflare_access_application" "terraform_managed_resource_b467e553-757c-4146-b08f-5e2edae3b1bc" {
  account_id                 = "e0f1db5d1481215971b3e68bd43688cc"
  app_launcher_visible       = true
  auto_redirect_to_identity  = false
  domain                     = "casaparo-potal.com"
  enable_binding_cookie      = false
  http_only_cookie_attribute = true
  name                       = "Casaparo"
  session_duration           = "24h"
  type                       = "self_hosted"
}

