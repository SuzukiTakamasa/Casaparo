use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Inventories {
    pub id: Option<u32>,
    pub types: u8,
    pub name: String,
    pub amount: u32,
    pub created_by: u8,
    pub version: u32
}


#[derive(Serialize, Deserialize, Debug)]
pub struct ShoppingNotes {
    pub id: Option<u32>,
    pub notes: String,
    pub is_registered: u8,
    pub created_by: u8,
    pub version: u32 
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExtractedShoppingNotes {
    pub id: Option<u32>,
    pub note_id: u32,
    pub note_types: u8,
    pub note_name: String,
    pub note_amount: u32,
    pub note_created_by: u8,
    pub note_version: u32,
    pub is_registered: Option<u8>,
    pub created_by: Option<u8>,
    pub version: Option<u32> 
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RegisteringInventoriesList {
    pub note_id: u32,
    pub note_types: u8,
    pub note_name: String,
    pub note_amount: u32,
    pub note_created_by: u8,
    pub note_version: u32
}
