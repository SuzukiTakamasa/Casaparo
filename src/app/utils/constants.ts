
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
    year?: number,
    month?: number,
    from_date: number,
    to_date: number,
    from_time: string,
    created_by: number,
    label_id: number,
    to_time: string,
    version: number
}

export interface IsCompleted {
    is_completed: number
}

export interface FixedAmount {
    billing_amount: number
    total_amount: number
}

export interface WikiData {
    id?: number,
    title: string,
    content: string,
    created_by: number,
    updated_at: string,
    version: number
}

export type HouseholdResponse = HouseholdData[]

export type ScheduleResponse = ScheduleData[]

export type WikiResponse = WikiData[]

export type APIRequest = HouseholdData | ScheduleData | WikiData