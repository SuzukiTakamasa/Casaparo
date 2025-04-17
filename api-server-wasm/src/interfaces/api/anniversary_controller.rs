use crate::application::usecases::anniversary_usecases::AnniversaryUsecases;
use crate::domain::entities::setting::Anniversaries;
use crate::domain::repositories::anniversary_repository::AnniversaryRepository;
use crate::domain::entities::service::JSONResponse;
use worker::{Request, Response, Result};
use serde_json::from_str;

pub struct AnniversaryController<R: AnniversaryRepository> {
    usecases: AnniversaryUsecases<R>,
}

impl<R: AnniversaryRepository> AnniversaryController<R> {
    pub fn new(usecases: AnniversaryUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_anniversaries(&self) -> Result<Response> {
        match self.usecases.get_anniversaries().await {
            Ok(anniversary) => return Response::from_json(&anniversary),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn create_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => {
                let error_response = JSONResponse {
                    status: 400,
                    message: "Bad request".to_string(),
                };
                return Response::from_json(&error_response);
            }
        };
        let anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => {
                let error_response = JSONResponse {
                    status: 400,
                    message: "Invalid request body".to_string(),
                };
                return Response::from_json(&error_response);
            }
        };
        match self.usecases.create_anniversary(&anniversary).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Anniversary created successfully".to_string()
                };
                return Response::from_json(&success_response);
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn update_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => {
                let error_response = JSONResponse {
                    status: 400,
                    message: "Bad request".to_string(),
                };
                return Response::from_json(&error_response);
            }
        };
        let mut anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => {
                let error_response = JSONResponse {
                    status: 400,
                    message: "Invalid request body".to_string(),
                };
                return Response::from_json(&error_response);
            }
        };
        match self.usecases.update_anniversary(&mut anniversary).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Anniversary updated successfully".to_string()
                };
                return Response::from_json(&success_response)
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response)
            }
        };
    }

    pub async fn delete_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => {
                let error_response = JSONResponse {
                    status: 400,
                    message: "Bad request".to_string(),
                };
                return Response::from_json(&error_response);
            }
        };
        let mut anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => {
                let error_response = JSONResponse {
                    status: 400,
                    message: "Invalid request body".to_string(),
                };
                return Response::from_json(&error_response);
            }
        };
        match self.usecases.delete_anniversary(&mut anniversary).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Anniversary deleted successfully".to_string()
                };
                return Response::from_json(&success_response);
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }
}