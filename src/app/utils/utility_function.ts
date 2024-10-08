import dayjs from 'dayjs'

export const boolToInt = (flag: boolean): number => +flag
export const intToBool = (bit: number): boolean => !!bit

export const formatNumberWithCommas = (number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const setUser = (userInt: number): string => {
    switch (userInt) {
        case 2:
            return "🥺🥺ྀི"
        case 1:
            return "🥺"
        case 0:
            return "🥺ྀི"
        default:
            return "Invalid user"
    }
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
    const weekDays = ["日", "月", "火", "水", "木", "金", "土"] as const
    const weekDayIndex = new Date(dateStr).getDay()
    return weekDays[weekDayIndex]
}

export const getMonthArray = (): number[] => {
    const monthArray = []
    for (let m = 1; m <= 12; m++) {
        monthArray.push(m)
    }
    return monthArray
}

export const getDateArray = (month: number): number[] => {
    const dateArray = []
    const until30 = [4, 6, 9, 11]
    let numOfDate: number
    if (until30.includes(month)) {
        numOfDate = 30
    } else if (month === 2) {
        numOfDate = 29
    } else {
        numOfDate = 31
    }
    for (let d = 1; d <= numOfDate; d++) {
        dateArray.push(d)
    }
    return dateArray
}

export const isUnsignedInteger = (intStr: string): boolean => {
    return /^\d+$/.test(intStr)
}