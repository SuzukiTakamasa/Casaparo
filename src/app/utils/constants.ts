
export interface HouseholdData {
    id: number,
    name: string,
    amount: number,
    year: number,
    month: number
    is_deafult: number
    is_owner: number
}

export interface ScheduleData {
    id: number,
    description: string,
    year: number,
    month: number,
    date: number,
    from_time: string,
    to_time: string
}

export interface HouseholdResponse {
    households: HouseholdData[]
}

export interface ScheduleResponse {
    schedules: ScheduleData[]
}

export type APIRequest = HouseholdData | ScheduleData
export type APIResponse = HouseholdResponse | ScheduleResponse