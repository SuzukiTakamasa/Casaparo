"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'
import { TimePicker } from 'react-time-picker'
import dayjs from 'dayjs'

import { YearProvider, YearContext } from '@components/YearPicker'
import YearPicker from '@components/YearPicker'

import { MonthProvider, MonthContext } from '@components/MonthPaginator'
import MonthPaginator from '@components/MonthPaginator'

import { ScheduleData, ScheduleResponse } from '@utils/constants'
import { PencilIcon, TrashBoxIcon } from '@components/HeroicIcons'
import APIClient from '@utils/api_client'


const client = new APIClient()


const getDaysArray = (year: number, month: number) => {
    let daysArray = []
    let numberOfDays = new Date(year, month, 0).getDate()

    for (let d = 1; d <= numberOfDays; d++) {
        daysArray.push(new Date(year, month -1, d))
    }
    return daysArray
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
    const [version, setVersion] = useState(1)

    const { month } = useContext(MonthContext)
    const [scheduleMonth, setScheduleMonth] = useState(month)

    const { year } = useContext(YearContext)
    const [scheduleYear, setScheduleYear] = useState(year)

    const handleChangeFromTime = () => {
        setFromTime(fromTime)
    }

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
    }
    const handleOpenUpdateDialog = ({id, description, from_date, to_date, from_time, to_time, version}: ScheduleData) => {
        setShowDialog(true)
        setId(id as number)
        setDescription(description)
        setFromDate(from_date)
        setToDate(to_date)
        setFromTime(from_time)
        setToTime(to_time)
        setVersion(version)
        setIsUpdate(true)
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setId(0)
        setDescription("")
        setFromTime("0:00")
        setToTime("0:00")
        setVersion(1)
        setIsUpdate(false)
    }
    const fetchSchedules = useCallback(async () => {
        const schedules = await client.get<ScheduleResponse>(`/shcedule/${scheduleYear}/${scheduleMonth}`)
        setSchedules(schedules || [])
    }, [scheduleYear, scheduleMonth])
    const addSchedule = async () => {
        const addScheduleData = {
            description: description,
            from_date: fromDate,
            to_date: toDate,
            from_time: fromTime,
            to_time: toTime,
            version: version
        }
        const res = await client.post<ScheduleResponse>('/schedule/create', addScheduleData)
        await fetchSchedules()
    }
    const updateSchedule = async () => {
        const updateSchedule = {
            id: id,
            description: description,
            from_date: fromDate,
            to_date: toDate,
            from_time: fromTime,
            to_time: toTime,
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