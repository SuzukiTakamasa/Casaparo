use worker::Result;

pub fn validate_year(year: u16) -> Result<()> {
    if year < 2000 || 2100 < year {
        return Err(worker::Error::RustError("The year must be between 2000 and 2100.".to_string()));
    }
    Ok(())
}
pub fn validate_month(month: u8) -> Result<()> {
    if month < 1 || 12 < month {
        return Err(worker::Error::RustError("The month must be between 1 and 12.".to_string()));
    }
    Ok(())
}
pub fn validate_date(date: u8) -> Result<()> {
    if date < 1 || 31 < date {
        return Err(worker::Error::RustError("The date must be between 1 and 31.".to_string()));
    }
    Ok(())
}