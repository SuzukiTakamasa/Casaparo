#[macro_export]
macro_rules! error_msg {
    ($message:expr) => {
        worker::Error::RustError($message.to_string())
    };
}
