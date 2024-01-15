
export interface HouseholdData {
    name: string,
    amount: number,
    year: number,
    month: number
    is_deafult: number
    user?: string,
    user_id?: number,
    is_owner: number
}

export interface UserData {
    name: string,
    is_owner: number
}