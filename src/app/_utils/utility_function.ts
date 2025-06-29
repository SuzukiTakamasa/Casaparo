import dayjs from 'dayjs'
import { ScheduleResponse, TaskData } from "./interfaces"
import { CreatedBy, TaskConstants } from './constants'

export const boolToInt = (flag: boolean): number => +flag
export const intToBool = (bit: number): boolean => !!bit

export const formatNumberWithCommas = (number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const convertUrlsToLinks = (text: string): string => {
    const urlRegex = /https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
    })
}

export const adaptTwoPointReader = (text: string, maxLength: number): string => {
    const textLength = Array.from(text).reduce((count, str) => {
        return str.match(/[ -~]/) ? count + 1 : count + 2
    }, 0)
    return textLength > maxLength * 2 ? text.slice(0, maxLength - 1) + ".." : text
}

export const setCreatedByStr = (createdBy: number): string => {
    switch (createdBy) {
        case CreatedBy.TY:
            return "🥺🥺ྀི"
        case CreatedBy.T:
            return "🥺"
        case CreatedBy.Y:
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

export const splitYearMonthDayStr = (yyyymmddStr: string): readonly number[] & { length: 3 } => {
    const [year, month, day] = yyyymmddStr.split("/").map(v => Number(v))
    return [year, month, day] as const
}

export const _getCurrentDateAndDueDate = (dueDateStr: string): readonly Date[] & { length: 2} => {
    const [year, month, day] = splitYearMonthDayStr(dueDateStr)
    const dueDate = getDate(year, month, day)
    const currentDate = new Date()
    return [currentDate, dueDate] as const
} 

export const isWithinAWeekFromDueDate = (task: TaskData): boolean => {
    const [currentDate, dueDate] = _getCurrentDateAndDueDate(task.due_date)
    return (
        currentDate <= dueDate &&
        dueDate <= new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    )
}

export const isOverDueDate = (task: TaskData): boolean => {
    const [currentDate, dueDate] = _getCurrentDateAndDueDate(task.due_date)
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

export const getMonthArray = (): number[] & { length: 12 } => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
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

const sliceHour = (timeStr: string): number => { return Number(timeStr.split(":")[0]) } 
const sliceMinute = (timeStr: string): number => { return Number(timeStr.split(":")[1]) }

export const validateFromTimeAndToTime = (fromTimeStr: string, toTimeStr: string): boolean => {
    let isValid = true
    if (sliceHour(fromTimeStr) > sliceHour(toTimeStr)) {
        isValid = false
    } else if (sliceHour(fromTimeStr) === sliceHour(toTimeStr)) {
        if (sliceMinute(fromTimeStr) > sliceMinute(toTimeStr)) {
            isValid = false
        }
    }
    return isValid
}

export const sortSchedulesByFromDate = (schedules: ScheduleResponse): ScheduleResponse => {
    schedules.sort((a, b) => {
        return a.from_date - b.from_date
    })
    return schedules
}

export const sortSchedulesByTime = (schedules: ScheduleResponse): ScheduleResponse => {
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
        case TaskConstants.Status.NEW:
            return "未着手"
        case TaskConstants.Status.IN_PROGRESS:
            return "着手中"
        case TaskConstants.Status.COMPLETED:
            return "完了"
        default:
            return "-"
    }
}

export const setPriorityStr = (priority: number): string => {
    switch (priority) {
        case TaskConstants.Priority.LOW:
            return "低"
        case TaskConstants.Priority.MIDDLE:
            return "中"
        case TaskConstants.Priority.HIGH:
            return "高"
        default:
            return "-"
    }
}

export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    if (typeof window === 'undefined') {
        return new Uint8Array() // Return an empty Uint8Array if window is not defined (e.g. during SSR)
      }
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}