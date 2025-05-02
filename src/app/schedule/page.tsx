"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'

import { YearProvider, YearContext } from '@components/YearPicker'
import YearPicker from '@components/YearPicker'

import { MonthProvider, MonthContext } from '@components/MonthPaginator'
import MonthPaginator from '@components/MonthPaginator'

import { ScheduleData, ScheduleResponse, LabelResponse, AnniversaryData, AnniversaryResponse } from '@/app/utils/interfaces'
import { TrashBoxIcon, PlusIcon } from '@/app/components/Heroicons'
import { ToasterComponent, APIResponseToast } from '@components/ToastMessage'
import { APIClient, WebPushSubscriber, execExternalGetAPI} from '@utils/api_client'
import { setUser, getToday, getNumberOfDays, getWeekDay, getMonthArray, sortSchedulesByDateTime, validateFromTimeAndToTime } from '@utils/utility_function'


const client = new APIClient()


const getTimeArray = (): string[] => {
    const timeArray = []
    for (let h = 0; h <= 23; h++) {
        for (let m = 0; m <= 30; m += 30) {
            timeArray.push(`${h}:${m === 0 ? '00' : m}`)
        }
    }
    timeArray.push("未定")
    return timeArray
}

const Schedule = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    const [activeTab, setActiveTab] = useState('month')
    const [descriptionValidMsg, setDescriptionValidMsg] = useState("")
    const [yearValidMsg, setYearValidMsg] = useState("")
    const [monthValidMsg, setMonthValidMsg] = useState("")
    const [dateValidMsg, setDateValidMsg] = useState("")
    const [createdByValidMsg, setCreatedByValidMsg] = useState("")

    const { month } = useContext(MonthContext)
    const [scheduleMonth, setScheduleMonth] = useState(month)

    const { year } = useContext(YearContext)
    const [scheduleYear, setScheduleYear] = useState(year)

    const numberOfDays = getNumberOfDays(scheduleYear, scheduleMonth)
    const today = getToday()
    const [holidays, setHolidays] = useState<string[]>([])

    const [schedules, setSchedules] = useState<ScheduleResponse>([])
    const [id, setId] = useState(0)
    const [description, setDescription] = useState("")
    const [fromYear, setFromYear] = useState(year)
    const [toYear, setToYear] = useState(year)
    const [fromMonth, setFromMonth] = useState(month)
    const [toMonth, setToMonth] = useState(month)
    const [fromDate, setFromDate] = useState(today)
    const [toDate, setToDate] = useState(today)
    const [fromTime, setFromTime] = useState("0:00")
    const [toTime, setToTime] = useState("0:00")
    const [createdByT, setCreatedByT] = useState(false)
    const [createdByY, setCreatedByY] = useState(false)
    const [createdBy, setCreatedBy] = useState<number|null>(null)
    const [labelId, setLabelId] = useState(0)
    const [version, setVersion] = useState(1)

    const [labels, setLabels] = useState<LabelResponse>([])
    const [anniversaries, setAnniversaries] = useState<AnniversaryResponse>([])

    const [monthDaysArray, setMonthDaysArray] = useState<number[]>([])
    const [weekDaysArray, setWeekDaysArray] = useState<number[]>([])
    const [isMultipleDays, setIsMultipleDays] = useState(false)
    const [isNotified, setIsNotified] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)

    const subscriber = new WebPushSubscriber(client)


    const getCalendar = (year: number, month: number, day: number) => {

        let dateColorStr = ""
        const isHoliday = holidays.includes(`${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`)

        switch (getWeekDay(year, month, day)) {
            case "土":
                dateColorStr += isHoliday ? "text-red-500 font-bold" : "text-blue-500 font-bold"
            case "日":
                dateColorStr += "text-red-500 font-bold"
            default: 
                dateColorStr += isHoliday ? "text-red-500 font-bold" : "text-white font-bold"
        }

        const isDisplayed = (schedule: ScheduleData) => {
            let isDisplayedFlag = false
            if (schedule.from_year <= year && year <= schedule.to_year) {
                if (schedule.from_year === schedule.to_year) {
                    //年を跨がない場合
                    if (schedule.from_month <= month && month <= schedule.to_month) {
                        if (schedule.from_month === schedule.to_month) {
                            //月を跨がない場合
                            if (schedule.from_date <= day && day <= schedule.to_date) {
                                isDisplayedFlag = true
                            }
                        } else {
                            //月を跨ぐ場合
                            if (schedule.from_month === month) {
                                if (schedule.from_date <= day && day <= numberOfDays) {
                                    isDisplayedFlag = true
                                }
                            } else if (schedule.to_month === month) {
                                if (1 <= day && day <= schedule.to_date) {
                                    isDisplayedFlag = true
                                }
                            } else {
                                isDisplayedFlag = true
                            }
                        }
                    }
                } else {
                    //年を跨ぐ場合
                    if (schedule.from_year === year) {
                        if (schedule.from_month <= month) {
                            if (schedule.from_month === month) {
                                if (schedule.from_date <= day && day <= numberOfDays) {
                                    isDisplayedFlag = true
                                }
                            } else {
                                isDisplayedFlag = true
                            }
                        }
                    } else if (schedule.to_year === year) {
                        if (month <= schedule.to_month) {
                            if (schedule.to_month === month) {
                                if (1 <= day && day <= schedule.to_date) {
                                    isDisplayedFlag = true
                                }
                            } else {
                                isDisplayedFlag = true
                            }
                        }
                    } else {
                    isDisplayedFlag = true
                    }
                }
            }
            return isDisplayedFlag
          }
        
        const isAnniversary = (anniversary: AnniversaryData) => {
            return (month === anniversary.month &&
                    day === anniversary.date)
        }
    
        return (
            <>
                <td className="border-b py-1 flex-row justify-center items-center space-x-1 text-sm">
                    <div className="flex justify-left">
                        <div className={dateColorStr}>
                        {`${day}日(${getWeekDay(year, month, day)})`}
                        </div>
                        <button
                            className="text-white ml-2"
                            onClick={() => handleOpenAddDialogWithPlueIcon(year, month, day)}
                        >
                            <PlusIcon/>
                        </button>
                    </div>
                </td>
                <td className="border-b py-1 flex-col justify-center items-center space-x-1 text-sm">
                    {sortSchedulesByDateTime(schedules).map((schedule, i) => (
                        isDisplayed(schedule) &&
                        <button 
                            key={i}
                            className="bg-blue-600 hover:bg-blue-800 text-white py-1 px-2 m-1 rounded-full"
                            onClick={() => handleOpenUpdateDialog({
                                id: schedule.id,
                                description: schedule.description,
                                from_year: schedule.from_year,
                                to_year: schedule.to_year,
                                from_month: schedule.from_month,
                                to_month: schedule.to_month,
                                from_date: schedule.from_date,
                                to_date: schedule.to_date,
                                from_time: schedule.from_time,
                                to_time: schedule.to_time,
                                created_by: schedule.created_by,
                                label_id: schedule.label_id,
                                version: schedule.version
                            })}
                        >
                            {`${setUser(schedule.created_by)}${schedule.label !== null ? schedule.label : ""} ${schedule.from_date !== day ? "0:00" : schedule.from_time}-${schedule.to_date !== day ? "23:59" : schedule.to_time} ${schedule.description}`}
                        </button>
                    ))}
                    {anniversaries.map((anniversary, i) => (
                        isAnniversary(anniversary) &&
                        <button
                            key={i}
                            className="bg-orange-600 hover:bg-orange-800 text-white py-1 px-2 m-1 rounded-full"
                        >
                            {anniversary.description}
                        </button>
                    ))}
                </td>
            </>
        )
    }

    const validate = () => {
        let isValid = true
        if (description === "") {
            isValid = false
            setDescriptionValidMsg("予定を入力してください。")
        }
        if (isMultipleDays && fromYear > toYear) {
            isValid = false
            setYearValidMsg("開始年より前の終了年は選択できません。")
        }
        if (isMultipleDays && (fromYear === toYear && fromMonth > toMonth)) {
            isValid = false
            setMonthValidMsg("開始月より前の終了月は選択できません。")
        }
        if (isMultipleDays && (fromYear === toYear && fromMonth == toMonth) && fromDate >= toDate) {
            isValid = false
            setDateValidMsg("終了日は開始日より後の日付を選択してください。")
        }
        if (createdBy === null && !createdByT && !createdByY) {
            isValid = false
            setCreatedByValidMsg("いずれかまたは両方の登録者を選択してください。")
        }
        if (isNotified && !isSubscribed) {
            isValid = false
            setCreatedByValidMsg("通知を受け取るには、設定からPush通知の購読設定を行なってください。")
        }
        return isValid
    }
    const handleSetCreatedBy = useCallback(() => {
        if (createdByT && createdByY) {
            return 2
        } else if (createdByT && !createdByY) {
            return 1
        } else if (!createdByT && createdByY) {
            return 0
        }
        return null
    }, [createdByT, createdByY])
    const handleSetCreatedByTAndY = (value: number) => {
        setCreatedBy(value)
        switch (value) {
            case 2:
                setCreatedByT(true)
                setCreatedByY(true)
                break
            case 1:
                setCreatedByT(true)
                setCreatedByY(false)
                break
            case 0:
                setCreatedByT(false)
                setCreatedByY(true)
                break
        }
    }
    const handleAddSchedule = async () => {
        if (!validate()) return
        const response = await addSchedule()
        handleCloseDialog()
        APIResponseToast(response, "予定を登録しました。", "予定の登録に失敗しました。")
    }
    const handleUpdateSchedule = async () => {
        if (!validate()) return
        const response = await updateSchedule()
        handleCloseDialog()
        APIResponseToast(response, "予定を更新しました。", "予定の更新に失敗しました。")
    }
    const handleDeleteSchedule = () => {
        deleteSchedule({
            id: id,
            description: description,
            from_year: fromYear,
            to_year: toYear,
            from_month: fromMonth,
            to_month: toMonth,
            from_date: fromDate,
            to_date: toDate,
            from_time: fromTime,
            to_time: toTime,
            created_by: createdBy as number,
            label_id: labelId,
            version: version
        })
        handleCloseDialog()
    }
    const handleOpenAddDialog = () => {
        fetchLabels()
        setShowDialog(true)
        setFromYear(scheduleYear)
        setToYear(scheduleYear)
        setFromMonth(scheduleMonth)
        setToMonth(scheduleMonth)
        setFromDate(today)
        setToDate(today)
    }
    const handleOpenAddDialogWithPlueIcon = (year: number, month: number, day: number) => {
        fetchLabels()
        setShowDialog(true)
        setFromYear(year)
        setToYear(year)
        setFromMonth(month)
        setToMonth(month)
        setFromDate(day)
        setToDate(day)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleOpenUpdateDialog = ({id, description, from_year, to_year, from_month, to_month, from_date, to_date, from_time, to_time, created_by, label_id, version}: ScheduleData) => {
        fetchLabels()
        setShowDialog(true)
        setId(id as number)
        setDescription(description)
        setFromYear(from_year)
        setToYear(to_year)
        setFromMonth(from_month)
        setToMonth(to_month)
        setFromDate(from_date)
        setToDate(to_date)
        setFromTime(from_time)
        setToTime(to_time)
        handleSetCreatedByTAndY(created_by)
        setLabelId(label_id)
        setVersion(version)
        setIsUpdate(true)
        from_date !== to_date && setIsMultipleDays(true)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setId(0)
        setDescription("")
        setFromYear(scheduleYear)
        setToYear(scheduleYear)
        setFromMonth(scheduleMonth)
        setToMonth(scheduleMonth)
        setFromDate(today)
        setToDate(today)
        setFromTime("0:00")
        setToTime("0:00")
        setCreatedByT(false)
        setCreatedByY(false)
        setCreatedBy(null)
        setLabelId(0)
        setVersion(1)
        setIsUpdate(false)
        setIsMultipleDays(false)
        setYearValidMsg("")
        setMonthValidMsg("")
        setDateValidMsg("")
        setDescriptionValidMsg("")
        setCreatedByValidMsg("")
        setIsNotified(false)
    }
    const handleIsMultipleDays = () => {
        setIsMultipleDays(!isMultipleDays)
    }
    const fetchSchedules = useCallback(async () => {
        const schedules = await client.get<ScheduleResponse>(`/v2/schedule`)
        setSchedules(schedules.data || [])
    }, [])
    const addSchedule = async () => {
        const addScheduleData = {
            description: description,
            from_year: fromYear,
            to_year: isMultipleDays ? toYear : fromYear,
            from_month: fromMonth,
            to_month: isMultipleDays ? toMonth : fromMonth,
            from_date: fromDate,
            to_date: isMultipleDays ? toDate : fromDate,
            from_time: fromTime,
            to_time: toTime,
            created_by: createdBy as number,
            label_id: labelId,
            version: version
        }
        const response = await client.post<ScheduleData>('/v2/schedule/create', addScheduleData)
        if (isNotified) {
            await subscriber.broadcast({
                title: "新しい予定が追加されました",
                body: `${description}\n${fromYear}-${fromMonth}-${fromDate} ${fromTime}\n~${toYear}-${toMonth}-${toDate} ${toTime}`
            })
        }
        await fetchSchedules()
        return response
    }
    const fetchLabels = async () => {
        const labels = await client.get<LabelResponse>("/v2/label")
        setLabels(labels.data || [])
    }
    const updateSchedule = async () => {
        const updateSchedule = {
            id: id,
            description: description,
            from_year: fromYear,
            to_year: isMultipleDays ? toYear : fromYear,
            from_month: fromMonth,
            to_month: isMultipleDays ? toMonth : fromMonth,
            from_date: fromDate,
            to_date: isMultipleDays ? toDate : fromDate,
            from_time: fromTime,
            to_time: toTime,
            created_by: createdBy as number,
            label_id: labelId,
            version: version
        }
        const response = await client.post<ScheduleData>('/v2/schedule/update', updateSchedule)
        if (isNotified) {
            await subscriber.broadcast({
                title: "予定が更新されました",
                body: `${description}\n${fromYear}-${fromMonth}-${fromDate} ${fromTime}\n~${toYear}-${toMonth}-${toDate} ${toTime}`
            })
        }
        await fetchSchedules()
        return response
    }
    const deleteSchedule = async (deletedScheduleData: ScheduleData) => {
        if (!window.confirm("削除しますか？")) return
        const response = await client.post<ScheduleData>('/v2/schedule/delete', deletedScheduleData)
        APIResponseToast(response, "予定を削除しました。", "予定の削除に失敗しました。")
        await fetchSchedules()
    }
    const handleGenerateMonthDaysArray = useCallback(() => {
        setMonthDaysArray([])
        const darr = []
            for (let d = 1; d <= numberOfDays; d++) {
                darr.push(d)
            }
        setMonthDaysArray(darr)
    }, [activeTab, scheduleYear, scheduleMonth])
    const handleGenerateWeekDaysArray = useCallback(() => {
        setWeekDaysArray([])
        const darr = []

        const dateIndex = new Date().getDay() // 0(SUN) - 6(SAT)
        const dateIndex1 = new Date(`${year}-${month < 10 ? `0${month}` : month}-01`).getDay() // yyyy-mm-01

        const startWeekDate = today > dateIndex ? today - dateIndex : 1
        const endWeekDate = today > dateIndex ? startWeekDate + 6 : 7 - dateIndex1

            for (let d = startWeekDate; d <= endWeekDate; d++) {
                darr.push(d)
                if (d === numberOfDays) {
                    break
                }
            }
        setWeekDaysArray(darr)
    }, [activeTab])
    const handleGetHolidaysList = useCallback(async () => {
        const holidayList = await execExternalGetAPI<{[key: string]: string}>(`https://holidays-jp.github.io/api/v1/${scheduleYear}/date.json`)
        for (var d in holidayList.data) {
            holidays.push(d)
        }
        setHolidays(holidays)
    }, [scheduleYear])
    const fetchAnniversaries = useCallback(async () => {
        const anniversaries = await client.get<AnniversaryResponse>('/v2/anniversary')
        setAnniversaries(anniversaries.data || [])
    }, [])
    const fetchIsSubscribed = useCallback(async () => {
        const res = await subscriber.fetchSubscription()
        if (res.data) {
            setIsSubscribed(true)
        }
    }, [])

    useEffect(() => {
        handleGetHolidaysList()
        fetchSchedules()
        fetchAnniversaries()
    }, [handleGetHolidaysList, fetchSchedules, fetchAnniversaries])

    useEffect(() => {
        handleGenerateMonthDaysArray()
        handleGenerateWeekDaysArray()
    }, [handleGenerateMonthDaysArray, handleGenerateWeekDaysArray])

    useEffect(() => {
        const newCreatedBy = handleSetCreatedBy()
        setCreatedBy(newCreatedBy)
    }, [createdByT, createdByY, handleSetCreatedBy])

    useEffect(() => {
        if (activeTab === 'week') {
            setActiveTab('month')
        }
    }, [scheduleYear, scheduleMonth])

    useEffect(() => {
        fetchIsSubscribed()
    })

    return (
        <>
            <MonthProvider month={scheduleMonth} setMonth={setScheduleMonth} setYear={setScheduleYear}>
                <h1 className="text-2xl font-bold mc-4">🦀 スケジュール 🦀</h1>

                <YearProvider year={scheduleYear} setYear={setScheduleYear}>
                    <YearPicker />
                </YearProvider>

                <div className="container mx-auto p-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                        onClick={handleOpenAddDialog}
                    >
                    登録
                    </button>
                    <MonthPaginator monthStr="月" cssStr="text-lg font-bold mx-4" />

                    {showDialog && (
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-4 rounded">
                                <div className="flex flex-col space-y-4 mb-4">
                                    <input
                                        className="border p-2 text-black"
                                        type="text"
                                        placeholder="予定"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                    {descriptionValidMsg !== "" && <div className="text-sm text-red-500">{descriptionValidMsg}</div>}
                                    <div className="flex justify-center">
                                    <label className="text-black">
                                        <span>年{isMultipleDays && '(開始年)'}</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={fromYear}
                                            onChange={e => setFromYear(Number(e.target.value))}
                                        >
                                            <option value={year - 1}>{`${year - 1}年`}</option>
                                            <option value={year}>{`${year}年`}</option>
                                            <option value={year + 1}>{`${year + 1}年`}</option>
                                        </select>
                                    </label>
                                    <label className="text-black">
                                        <span>月{isMultipleDays && '(開始月)'}</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={fromMonth}
                                            onChange={e => setFromMonth(Number(e.target.value))}
                                        >
                                            {getMonthArray().map((m, i) => (
                                                <option key={i} value={m}>{`${m}月`}</option>
                                        ))}
                                        </select>
                                    </label>
                                    <label className="text-black">
                                        <span>日付{isMultipleDays && '(開始日)'}</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={fromDate}
                                            onChange={e => setFromDate(Number(e.target.value))}
                                        >
                                            {monthDaysArray.map((d, i) => (
                                                <option key={i} value={d}>{`${d}日(${getWeekDay(fromYear, fromMonth, d)})`}</option>
                                        ))}
                                        </select>
                                    </label>
                                    </div>
                                    {isMultipleDays &&
                                    <div className="flex justify-center">
                                        <label className="text-black">
                                            <span>年(終了年)</span>
                                            <select
                                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                                value={toYear}
                                                onChange={e => setToYear(Number(e.target.value))}
                                            >
                                                <option value={year - 1}>{`${year - 1}年`}</option>
                                                <option value={year}>{`${year}年`}</option>
                                                <option value={year + 1}>{`${year + 1}年`}</option>
                                            </select>
                                        </label>
                                        <label className="text-black">
                                            <span>月(終了月)</span>
                                            <select
                                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                                value={toMonth}
                                                onChange={e => setToMonth(Number(e.target.value))}
                                            >
                                                {getMonthArray().map((m, i) => (
                                                    <option key={i} value={m}>{`${m}月`}</option>
                                            ))}
                                            </select>
                                        </label>
                                        <label className="text-black">
                                            <span>日付(終了日)</span>
                                            <select
                                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                                value={toDate}
                                                onChange={e => setToDate(Number(e.target.value))}
                                            >
                                                {monthDaysArray.map((d, i) => (
                                                    <option key={i} value={d}>{`${d}日(${getWeekDay(toYear, toMonth, d)})`}</option>
                                            ))}
                                            </select>
                                        </label>
                                    </div>
                                    }
                                    {yearValidMsg !== "" && <div className="text-sm text-red-500">{yearValidMsg}</div>}
                                    {monthValidMsg !== "" && <div className="text-sm text-red-500">{monthValidMsg}</div>}
                                    {dateValidMsg !== "" && <div className="text-sm text-red-500">{dateValidMsg}</div>}
                                    <label className="flex items-center space-x-2 text-black">
                                        <input
                                            type="checkbox"
                                            checked={isMultipleDays}
                                            onChange={handleIsMultipleDays}
                                        />
                                        <span>複数日付を選択</span>
                                    </label>
                                    <div className="flex justify-center">
                                        <label className="text-black mx-1">
                                        <span>時刻(開始)</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={fromTime}
                                            onChange={e => {
                                                setFromTime(e.target.value)
                                                if (!isMultipleDays && !validateFromTimeAndToTime(e.target.value, toTime)) {
                                                    setToTime(e.target.value)
                                                }
                                            }}
                                        >
                                            {getTimeArray().map((t, i) => (
                                                <option key={i} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        </label>
                                        <label className="text-black mx-1">
                                        <span>時刻(終了)</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={toTime}
                                            onChange={e => setToTime(e.target.value)}
                                        >
                                            {isMultipleDays ?
                                            getTimeArray().map((t, i) => (
                                                <option key={i} value={t}>{t}</option>
                                            ))
                                            :
                                            getTimeArray().filter(t => validateFromTimeAndToTime(fromTime, t)).map((t, i) => (
                                                <option key={i} value={t}>{t}</option>
                                            ))
                                            }
                                        </select>
                                        </label>
                                    </div>
                                    <div className="text-black">作成者</div>
                                    <div className="text-3xl text-center">
                                        <input
                                            type="checkbox"
                                            checked={createdByT}
                                            onClick={() => setCreatedByT(!createdByT)}
                                            />
                                            <span className="mr-8">🥺</span>
                                        <input
                                            type="checkbox"
                                            checked={createdByY}
                                            onClick={() => setCreatedByY(!createdByY)}
                                            />
                                            <span>🥺ྀི</span>
                                    </div>
                                    {createdByValidMsg !== "" && <div className="text-sm text-red-500">{createdByValidMsg}</div>}
                                    <div>
                                        <label className="text-black">
                                        <span>ラベル(任意)</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={labelId}
                                            onChange={e => setLabelId(Number(e.target.value))}
                                        >
                                            <option value={0}>ラベルを選択</option>
                                            {labels.map((l, i) => (
                                                <option key={i} value={l.id}>{`${l.label} ${l.name}`}</option>
                                            ))}
                                        </select>
                                        </label>
                                    </div>
                                    {/*<div>
                                        <label className="text-black">
                                        <input
                                            type="checkbox"
                                            checked={isNotified}
                                            onChange={e => setIsNotified(!isNotified)}
                                        />
                                        <span className="ml-2">通知を受け取る</span>
                                        </label>
                                    </div>*/}
                                </div>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={isUpdate ? handleUpdateSchedule : handleAddSchedule}
                                    >
                                        {isUpdate ? "変更" : "登録"}
                                    </button>
                                    <button
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={handleCloseDialog}
                                    >
                                        キャンセル
                                    </button>
                                    {isUpdate && 
                                        <button
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                                            onClick={handleDeleteSchedule}
                                        >
                                            <TrashBoxIcon />
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-t lg border-b-2 ${activeTab === 'month' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-transparent nover:bg-gray-100' }`}
                            onClick={() => setActiveTab('month')}
                        >
                            月
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-t lg border-b-2 ${!(year === scheduleYear && month === scheduleMonth) && 'opacity-50 cursor-not-allowed'} ${activeTab === 'week' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-transparent nover:bg-gray-100' }`}
                            onClick={() => setActiveTab('week')}
                            disabled={!(year === scheduleYear && month === scheduleMonth)}
                        >
                            週
                        </button>
                    </div>
                        <table className="table-auto min-w-full mt-4">
                            <thead>
                                <tr>
                                    <th className="border-b-2 py-1 bg-blue-900 text-sm">日付</th>
                                    <th className="border-b-2 py-1 bg-blue-900 text-sm">予定</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === "month" && monthDaysArray.map((d, i) => (
                                    <tr key={i} className={`${year === scheduleYear && month === scheduleMonth && today === d && "bg-gray-500"}`}>
                                        {getCalendar(scheduleYear, scheduleMonth, d)}
                                    </tr>
                                ))}
                                {activeTab === "week" && weekDaysArray.map((d, i) => (
                                    <tr key={i} className={`${today === d && "bg-gray-500"}`}>
                                        {getCalendar(scheduleYear, scheduleMonth, d)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                </div>
            </MonthProvider>
            <ToasterComponent />
        </>
    )
}

export default Schedule