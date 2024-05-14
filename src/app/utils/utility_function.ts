import dayjs from 'dayjs'

export const boolToInt = (flag: boolean): number => +flag
export const intToBool = (bit: number): boolean => !!bit

export const formatNumberWithCommas = (number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const setUser = (userInt: number): string => {
    return userInt ? "🥺" : "🥺ྀི"
}

export const getCurrentDateTime = (): string => {
    const now = dayjs()
    const formattedDateTime = now.format('YYYY/MM/DD HH:mm')
    return formattedDateTime
}

export const getWeekDay = (year: number, month: number, day: number): string => {
    const monthStr = month < 10 ? `0${month}` : month
    const dayStr = day < 10 ? `0${day}` : day
    const dateStr = `${year}-${monthStr}-${dayStr}`
    const weekDays = ["日", "月", "火", "水", "木", "金", "土"]
    const weekDayIndex = new Date(dateStr).getDay()
    return weekDays[weekDayIndex]
}