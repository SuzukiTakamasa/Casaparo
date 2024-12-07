import dayjs from 'dayjs'
import { ScheduleResponse, TaskData } from "./interfaces"

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

export const getToday = (): number => {
    return new Date().getDate()
}

export const getDate = (year: number, month: number, day: number): Date => {
    return new Date(`${year}-${month}-${day}`)
}

export const isWithinAWeekFromDueDate = (task: TaskData): boolean => {
    const [year, month, day] = task.due_date.split("/").map(v => Number(v))
    const dueDate = getDate(year, month, day)
    const currentDate = new Date()
    return currentDate <= dueDate && dueDate <= new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
}

export const isOverDueDate = (task: TaskData): boolean => {
    const [year, month, day] = task.due_date.split("/").map(v => Number(v))
    const dueDate = getDate(year, month, day)
    const currentDate = new Date()
    return dueDate < currentDate
}

export const getNumberOfDays = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate()
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

export const sortSchedulesByDateTime = (schedules: ScheduleResponse): ScheduleResponse => {
    const sliceHour = (timeStr: string) => { return Number(timeStr.split(":")[0]) } 
    const sliceMinute = (timeStr: string) => { return Number(timeStr.split(":")[1]) }

    schedules.sort((a, b) => {
        if (sliceHour(a.from_time) > sliceHour(b.from_time)) {
            return 1
        } else if (sliceHour(a.from_time) < sliceHour(b.from_time)) {
            return -1
        } else {
            if (sliceMinute(a.from_time) > sliceMinute(b.from_time)) {
                return 1
            } else if (sliceMinute(a.from_time) < sliceMinute(b.from_time)) {
                return -1
            } else {
                return 0
            }
        }
    })
    schedules.sort((a, b) => {
        if (sliceHour(a.to_time) > sliceHour(b.to_time)) {
            return 1
        } else if (sliceHour(a.to_time) < sliceHour(b.to_time)) {
            return -1
        } else {
            if (sliceMinute(a.to_time) > sliceMinute(b.to_time)) {
                return 1
            } else if (sliceMinute(a.to_time) < sliceMinute(b.to_time)) {
                return -1
            } else {
                return 0
            }
        }
    })
    return schedules
}

export const setStatusStr = (status: number): string => {
    switch (status) {
        case 0:
            return "未着手"
        case 1:
            return "着手中"
        case 2:
            return "完了"
        default:
            return "-"
    }
}

export const setPriorityStr = (priority: number): string => {
    switch (priority) {
        case 0:
            return "低"
        case 1:
            return "中"
        case 2:
            return "高"
        default:
            return "-"
    }
}