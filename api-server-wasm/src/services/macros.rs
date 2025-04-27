macro_rules! worker_error {
    ($err_msg:expr) => {
        Err(worker::Error::RustError($err_msg.to_string()))
    }
}

macro_rules! optimistic_lock {
    ($latest:expr, $current:expr) => {
        if let Some(latest) = $latest {
            if $current.version == latest.version {
                $current.version += 1;
            } else {
                return worker_error!("Attempt to update a stale object");
            }
        } else {
            return worker_error!("Version is found None");
        }
    }
}