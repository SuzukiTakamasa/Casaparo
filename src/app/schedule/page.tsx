"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'

import { YearProvider, YearContext } from '../components/YearPicker'
import YearPicker from '../components/YearPicker'

import { MonthProvider, MonthContext } from '../components/MonthPaginator'
import MonthPaginator from '../components/MonthPaginator'

import { ScheduleData, ScheduleResponse } from '../utils/constants'
import { PencilIcon, TrashBoxIcon } from '../components/HeroicIcons'
import APIClient from '../utils/api_client'


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
    const [date, setDate] = useState("")
    const [fromTime, setFromTime] = useState("")
    const [toTime, setToTime] = useState("")
    const [version, setVersion] = useState(1)

    const { month } = useContext(MonthContext)
    const [scheduleMonth, setScheduleMonth] = useState(month)

    const { year } = useContext(YearContext)
    const [scheduleYear, setScheduleYear] = useState(year)

    return (
    <MonthProvider month={scheduleMonth} setMonth={setScheduleMonth}>
        <h1 className="text-2xl font-bold mc-4">🦀 スケジュール 🦀</h1>

        <YearProvider year={scheduleYear} setYear={setScheduleYear}>
            <YearPicker />
        </YearProvider>

        <div className="container mx-auto p-4">
            <MonthPaginator monthStr="月" cssStr="text-lg font-bold mx-4" />
        </div>
    </MonthProvider>
    )
}

export default Schedule