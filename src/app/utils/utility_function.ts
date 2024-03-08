
export const boolToInt = (flag: boolean) => +flag
export const intToBool = (bit: number) => !!bit

export const formatNumberWithCommas = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const setUser = (userInt: number) => {
    return userInt ? "🥺" : "🥺ྀི"
}