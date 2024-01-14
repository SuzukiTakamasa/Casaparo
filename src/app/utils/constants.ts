
export interface HouseholdData {
    name: string,
    amount: number,
    user?: string,
    user_id?: number,
    is_owner: number
}

export interface UserData {
    name: string,
    is_owner: number
}