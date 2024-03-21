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

export const getWeekDay = (year: number, month: number, day: number) => {
    const monthStr = month < 10 ? `0${month}` : month
    const dayStr = day < 10 ? `0${day}` : day
    const dateStr = `${year}-${monthStr}-${dayStr}`
    const weekDays = ["日", "月", "火", "水", "木", "金", "土"]
    const weekDayIndex = new Date(dateStr).getDay()
    return weekDays[weekDayIndex]
}