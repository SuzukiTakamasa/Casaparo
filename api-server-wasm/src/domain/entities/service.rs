use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LatestVersion {
    pub version: u32
}


#[macro_export]
macro_rules! optimistic_locking {
    ($entity:expr, $fetch_version_result:expr) => {{
        match $fetch_version_result {
            Some(latest) => {
                if $entity.version == latest.version {
                    $entity.version += 1;
                    Ok(())
                } else {
                    Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
                }
            },
            None => Err(worker::Error::RustError("Version is found None".to_string()))
        }
    }};
}

pub use optimistic_locking;