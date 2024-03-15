"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'

import { YearProvider, YearContext } from '@components/YearPicker'
import YearPicker from '@components/YearPicker'

import { MonthProvider, MonthContext } from '@components/MonthPaginator'
import MonthPaginator from '@components/MonthPaginator'

import { ScheduleData, ScheduleResponse } from '@utils/constants'
import { PencilIcon, TrashBoxIcon } from '@components/HeroicIcons'
import APIClient from '@utils/api_client'


const client = new APIClient()


const getTimeArray = () => {
    const timeArray = []
    for (let h = 0; h <= 23; h++) {
        for (let m = 0; m <= 30; m += 30) {
            timeArray.push(`${h}:${m === 0 ? '00' : m}`)
        }
    }
    return timeArray
}

const getWeekDay = (year: number, month: number, day: number) => {
    const monthStr = month < 10 ? `0${month}` : month
    const dayStr = day < 10 ? `0${day}` : day
    const dateStr = `${year}-${monthStr}-${dayStr}`
    const weekDays = ["日", "月", "火", "水", "木", "金", "土", "日"]
    const weekDayIndex = new Date(dateStr).getDay()
    return weekDays[weekDayIndex]
}


const Schedule = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)

    const [schedules, setSchedules] = useState<ScheduleResponse>([])
    const [id, setId] = useState(0)
    const [description, setDescription] = useState("")
    const [fromDate, setFromDate] = useState(1)
    const [toDate, setToDate] = useState(1)
    const [fromTime, setFromTime] = useState("0:00")
    const [toTime, setToTime] = useState("0:00")
    const [createdBy, setCreatedBy] = useState(1)
    const [label, setLabel] = useState(0)
    const [version, setVersion] = useState(1)

    const [daysArray, setDaysArray] = useState<number[]>([])
    const [isMultipleDays, setIsMultipleDays] = useState(false)

    const { month } = useContext(MonthContext)
    const [scheduleMonth, setScheduleMonth] = useState(month)

    const { year } = useContext(YearContext)
    const [scheduleYear, setScheduleYear] = useState(year)


    const handleAddSchedule = () => {
        addSchedule()
        handleCloseDialog()
    }
    const handleUpdateSchedule = () => {
        updateSchedule()
        handleCloseDialog()
    }
    const handleOpenAddDialog = () => {
        setShowDialog(true)
        handleGenerateDaysArray()
    }
    const handleOpenUpdateDialog = ({id, description, from_date, to_date, from_time, to_time, created_by, label_id, version}: ScheduleData) => {
        setShowDialog(true)
        setId(id as number)
        setDescription(description)
        setFromDate(from_date)
        setToDate(to_date)
        setFromTime(from_time)
        setToTime(to_time)
        setCreatedBy(created_by)
        setLabel(label_id)
        setVersion(version)
        setIsUpdate(true)
        handleGenerateDaysArray()
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setId(0)
        setDescription("")
        setFromDate(1)
        setToDate(1)
        setFromTime("0:00")
        setToTime("0:00")
        setCreatedBy(1)
        setLabel(0)
        setVersion(1)
        setIsUpdate(false)
        handleResetDaysArray()
    }
    const handleIsMultipleDays = () => {
        setIsMultipleDays(!isMultipleDays)
    }
    const fetchSchedules = useCallback(async () => {
        const schedules = await client.get<ScheduleResponse>(`/shcedule/${scheduleYear}/${scheduleMonth}`)
        setSchedules(schedules || [])
    }, [scheduleYear, scheduleMonth])
    const addSchedule = async () => {
        if (!isMultipleDays) {
            setToDate(fromDate)
        }
        const addScheduleData = {
            description: description,
            from_date: fromDate,
            to_date: toDate,
            from_time: fromTime,
            to_time: toTime,
            created_by: createdBy,
            label_id: label,
            version: version
        }
        const res = await client.post<ScheduleResponse>('/schedule/create', addScheduleData)
        await fetchSchedules()
    }
    const updateSchedule = async () => {
        if (!isMultipleDays) {
            setToDate(fromDate)
        }
        const updateSchedule = {
            id: id,
            description: description,
            from_date: fromDate,
            to_date: toDate,
            from_time: fromTime,
            to_time: toTime,
            created_by: createdBy,
            label_id: label,
            version: version
        }
        const res = await client.post<ScheduleResponse>('/schedule/update', updateSchedule)
        await fetchSchedules()
    }
    const deleteSchedule = async (deletedScheduleData: ScheduleData) => {
        if (!window.confirm("削除しますか？")) return
        const res = await client.post<ScheduleResponse>('/shcedule/delete', deletedScheduleData)
        await fetchSchedules()
    }
    const handleGenerateDaysArray = () => {
        const darr = []
        let numberOfDays = new Date(scheduleYear, scheduleMonth, 0).getDate()

        for (let d = 1; d <= numberOfDays; d++) {
            darr.push(d)
        }
        setDaysArray(darr)
    }
    const handleResetDaysArray = () => {
        setDaysArray([])
    }

    useEffect(() => {
        fetchSchedules()
    }, [fetchSchedules])

    return (
    <MonthProvider month={scheduleMonth} setMonth={setScheduleMonth}>
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
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <label className="text-black">
                            <span>日付{isMultipleDays && '(開始日)'}</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={fromDate}
                                onChange={(e) => setFromDate(Number(e.target.value))}
                            >
                                {daysArray.map((d, i) => (
                                    <option key={i} value={d}>{`${d}日(${getWeekDay(scheduleYear, scheduleMonth, d)})`}</option>
                            ))}
                            </select>
                        </label>
                        {isMultipleDays &&
                        <label className="text-black">
                            <span>日付(終了日)</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={fromDate}
                                onChange={(e) => setFromDate(Number(e.target.value))}
                            >
                                {daysArray.map((d, i) => (
                                    <option key={i} value={d}>{`${d}日(${getWeekDay(scheduleYear, scheduleMonth, d)})`}</option>
                            ))}
                            </select>
                        </label>
                        }
                        <label className="flex items-center space-x-2 text-black">
                            <input
                                type="checkbox"
                                checked={isMultipleDays}
                                onChange={handleIsMultipleDays}
                            />
                            <span>複数日付を選択</span>
                        </label>
                        <div className="flex justify-center">
                            <label className="text-black">
                            <span>時刻(開始)</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={fromTime}
                                onChange={(e) => setFromTime(e.target.value)}
                            >
                                {getTimeArray().map((t, i) => (
                                    <option key={i} value={t}>{t}</option>
                                ))}
                            </select>
                            </label>
                            <label className="text-black">
                            <span>時刻(終了)</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={toTime}
                                onChange={(e) => setToTime(e.target.value)}
                            >
                                {getTimeArray().map((t, i) => (
                                    <option key={i} value={t}>{t}</option>
                                ))}
                            </select>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={isUpdate ? handleUpdateSchedule : handleAddSchedule}
                            disabled={description == "" || fromTime == "" || toTime == ""}
                        >
                            {isUpdate ? "変更" : "登録"}
                        </button>
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleCloseDialog}
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    </MonthProvider>
    )
}

export default Schedule