
export namespace HouseholdConstants {
    export const IsDefault = {
        NOT_DEFAULT: 0,
        DEFAULT: 1
    } as const

    export const IsOwner =  {
        NOT_OWNER: 0,
        OWNER: 1
    } as const

    export const IsCompleted =  {
        NOT_COMPLETED: 0,
        COMPLETED: 1
    } as const
}

export const DateOfFixedHousehold = 25


export const CreatedBy = {
    Y: 0,
    T: 1,
    TY: 2
} as const

export namespace ShoppingNoteConstants {
    export const IsRegistered = {
    NOT_REGISTERED: 0,
    REGISTERED: 1
} as const  
}
export namespace TaskConstants {
    export const Status = {
        COMPLETED: 2,
        IN_PROGRESS: 1,
        NEW: 0
    } as const

    export const Priority =  {
        HIGH: 2,
        MIDDLE: 1,
        LOW: 0
    } as const
}