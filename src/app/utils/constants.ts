
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

export interface WikiData {
    id?: number,
    title: string,
    content: string,
    created_by: number,
    updated_at: string,
    version: number
}

export interface LabelData {
    id?: number,
    name: string,
    label: string,
    version: number
}

export type HouseholdResponse = HouseholdData[]

export type ScheduleResponse = ScheduleData[]

export type WikiResponse = WikiData[]

export type LabelResponse = LabelData[]

export type APIRequest = HouseholdData | ScheduleData | WikiData | LabelData