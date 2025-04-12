
export interface Result<T> {
    data: T | null
    error: string | null
}

export interface IsSuccess {
    is_success: number
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

export interface InventoryTypeData {
    id?: number,
    types: string,
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
    is_registered: number,
    created_by: number,
    version: number
}

export interface ExtractedShoppingNoteData {
    id: number,
    note_id: number,
    note_types: number,
    note_name: string,
    note_amount: number,
    note_created_by: number,
    note_version: number,
    is_registered: number,
    created_by: number,
    version: number
}

export interface TaskData {
    id?: number,
    title: string,
    status: number,
    priority: number,
    description: string,
    created_by: number,
    updated_at: string,
    due_date: string,
    parent_task_id: number
    version: number
}

export interface TaskCommentData {
    id?: number,
    created_by: number,
    updated_at: string,
    comment: string,
    task_id: number,
    version: number
}

export interface HasTaskComments {
    has_comments: boolean
}

export interface R2Response extends Response {
    image_url: string
}

export interface DeleteImageRequest {
    file_name: string
}

export interface WebPushSubscriptionData {
	id?: number
	subscription_id: string,
	endpoint: string,
	p256h_key: string,
	auth_key: string,
	version: number
}

export interface BroadcastPayload {
    title: string
    body: string
}

export type HouseholdResponse = HouseholdData[]

export type HouseholdMonthlySummaryResponse = HouseholdMonthlySummaryData[]

export type ScheduleResponse = ScheduleData[]

export type WikiResponse = WikiData[]

export type LabelResponse = LabelData[]

export type AnniversaryResponse = AnniversaryData[]

export type InventoryTypeResponse = InventoryTypeData[]

export type InventoryResponse = InventoryData[]

export type ShoppingNoteResponse = ShoppingNoteData[]

export type ExtractedShoppingNoteResponse = ExtractedShoppingNoteData[]

export type TaskResponse = TaskData[]

export type TaskCommentResponse = TaskCommentData[]

export type APIRequest = HouseholdData |
                          ScheduleData |
                CompletedHouseholdData |
                              WikiData |
                             LabelData |
                       AnniversaryData |
                     InventoryTypeData |
                         InventoryData |
                      ShoppingNoteData |
             ExtractedShoppingNoteData |
                              TaskData |
                       TaskCommentData |
                       HasTaskComments |
               WebPushSubscriptionData

export type APIResponse = HouseholdResponse |
                           ScheduleResponse |
            HouseholdMonthlySummaryResponse |
                               WikiResponse |
                              LabelResponse |
                        AnniversaryResponse |
                      InventoryTypeResponse |
                          InventoryResponse |
                       ShoppingNoteResponse |
              ExtractedShoppingNoteResponse |
                               TaskResponse |
                        TaskCommentResponse |
                                FixedAmount |
                                IsCompleted |
                                     IsUsed