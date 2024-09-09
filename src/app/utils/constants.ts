
export interface Result<T> {
    data: T | null
    error: string | null
}

export interface HouseholdData {
    id?: number,
    name: string,
    amount: number,
    year?: number,
    month?: number
    is_default: number
    is_owner: number
    version: number
}

export interface ScheduleData {
    id?: number,
    description: string,
    from_year: number,
    to_year: number,
    from_month: number,
    to_month: number,
    from_date: number,
    to_date: number,
    from_time: string,
    to_time: string,
    created_by: number,
    label_id: number,
    version: number,
    label?: string
}

export interface IsCompleted {
    is_completed: number
}

export interface FixedAmount {
    billing_amount: number
    total_amount: number
}

export interface CompletedHouseholdData {
    year: number
    month: number
    detail: string
    billing_amount: number
    total_amount: number
}

export interface Detail {
    name: string
    amount: number
}

export interface HouseholdMonthlySummaryData {
    month?: number | null
    detail_name?: string
    detail_amount?: Number
    billing_amount: number
    total_amount: number
}

export interface WikiData {
    id?: number,
    title: string,
    content: string,
    created_by: number,
    updated_at: string,
    image_url: string,
    version: number
}

export interface LabelData {
    id?: number,
    name: string,
    label: string,
    version: number
}

export interface IsUsed {
    is_used: boolean
}

export interface AnniversaryData {
    id?: number,
    month: number,
    date: number,
    description: string,
    version: number
}

export interface InventoryData {
    id?: number,
    types: number,
    name: string,
    amount: number,
    created_by: number,
    version: number
}

export interface ShoppingNoteData {
    id?: number,
    notes: string,
    is_registered: boolean,
    created_by: number,
    version: number
}

export interface R2Response extends Response {
    image_url: string
}

export interface DeleteImageRequest {
    file_name: string
}

export type HouseholdResponse = HouseholdData[]

export type HouseholdMonthlySummaryResponse = HouseholdMonthlySummaryData[]

export type ScheduleResponse = ScheduleData[]

export type WikiResponse = WikiData[]

export type LabelResponse = LabelData[]

export type AnniversaryResponse = AnniversaryData[]

export type InventoryResponse = InventoryData[]

export type ShoppingNoteResponse = ShoppingNoteData[]

export type APIRequest = HouseholdData |
                          ScheduleData |
                CompletedHouseholdData |
                              WikiData |
                             LabelData |
                       AnniversaryData