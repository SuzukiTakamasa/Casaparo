#[macro_export]
macro_rules! worker_err {
    ($message:expr) => {
        worker::Error::RustError($message.to_string())
    };
}
