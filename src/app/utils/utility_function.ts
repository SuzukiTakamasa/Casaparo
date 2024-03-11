import dayjs from 'dayjs'

export const boolToInt = (flag: boolean) => +flag
export const intToBool = (bit: number) => !!bit

export const formatNumberWithCommas = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const setUser = (userInt: number) => {
    return userInt ? "🥺" : "🥺ྀི"
}

export const getCurrentDateTime = () => {
    const now = dayjs()
    const formattedDateTime = now.format('YYYY/MM/DD HH:mm')
    return formattedDateTime
}