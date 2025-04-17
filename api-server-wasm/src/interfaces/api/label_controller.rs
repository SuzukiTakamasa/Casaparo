use crate::application::usecases::label_usecases::LabelUsecases;
use crate::domain::entities::setting::Labels;
use crate::domain::repositories::label_repository::LabelRepository;
use crate::domain::entities::service::JSONResponse;
use worker::{Request, Response, Result, RouteContext};
use serde_json::from_str;
use crate::AppState;

pub struct LabelController<R: LabelRepository> {
    usecases: LabelUsecases<R>,
}

impl<R: LabelRepository> LabelController<R> {
    pub fn new(usecases: LabelUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_labels(&self) -> Result<Response> {
        match self.usecases.get_labels().await {
            Ok(labels) => return Response::from_json(&labels),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn is_used_for_schedule(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.is_used_for_schedule(id_as_u32).await {
            Ok(is_used) => return Response::from_json(&is_used),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn create_label(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let label: Labels = match from_str(json_body.as_str()) {
            Ok(label) => label,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.create_label(&label).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Label created successfully".to_string()
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

    pub async fn update_label(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut label: Labels = match from_str(json_body.as_str()) {
            Ok(label) => label,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.update_label(&mut label).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Label updated successfully".to_string()
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

    pub async fn delete_label(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut label: Labels = match from_str(json_body.as_str()) {
            Ok(label) => label,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_label(&mut label).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Label deleted successfully".to_string()
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
