"use client"

//export const runtime = 'edge'

import React, { useState, useContext, useCallback, useEffect } from 'react'
import { LineChartComponent, PieChartComponent } from '@components/Chart'
import Loader from '@components/Loader'

import { YearProvider, YearContext } from '@components/YearPicker'
import YearPicker from '@components/YearPicker'

import { MonthProvider, MonthContext } from '@components/MonthPaginator'
import MonthPaginator from '@components/MonthPaginator'

import APIClient from '@utils/api_client'
import { HouseholdMonthlySummaryResponse } from "@/app/utils/interfaces"


const client = new APIClient()


const Statistics = () => {

    const [annualHouseholdSummary, setAnnualHouseholdSummary] = useState<HouseholdMonthlySummaryResponse>([])
    const [monthlyHouseholdSummary, setMonthlyHouseholdSummary] = useState<HouseholdMonthlySummaryResponse>([])

    const { year } = useContext(YearContext)
    const { month } = useContext(MonthContext)

    const [mode, setMode] = useState("year")

    const [statisticsYear, setStatisticsYear] = useState(year)
    const [statisticsMonth, setStatisticsMonth] = useState(month)
    const [isLoading, setIsLoading] = useState(true)

    const fetchAnnualHousehold = useCallback(async () => {
        const res = await client.get<HouseholdMonthlySummaryResponse>(`/v2/completed_household/monthly_summary/${statisticsYear}`)
        if (res.data) {
            setAnnualHouseholdSummary(res.data)
            setIsLoading(false)
        }
    }, [statisticsYear])
    const fetchMonthlyHousehold = useCallback(async () => {
        const res = await client.get<HouseholdMonthlySummaryResponse>(`/v2/completed_household/monthly_summary/${statisticsYear}/${statisticsMonth}`)
        if (res.data) {
            setMonthlyHouseholdSummary(res.data)
            setIsLoading(false)
        }
    }, [statisticsMonth])

    useEffect(() => {
        fetchAnnualHousehold()
        fetchMonthlyHousehold()
    }, [fetchAnnualHousehold, fetchMonthlyHousehold])

    return (
        <>
            <h1 className="text-2xl font-bold mc-4">🛀 統計 🛀</h1>
            <div className="flex justify-left">
                <YearProvider year={statisticsYear} setYear={setStatisticsYear}>
                    <YearPicker/>
                </YearProvider>
                <input
                    className="ml-4"
                    type="checkbox"
                    value={mode}
                    checked={mode === "month"}
                    onChange={() => setMode(mode === "year" ? "month" : "year")} 
                />
                <div className="mt-2 ml-2">月ごとの内訳を表示する</div>
            </div>
            {mode === "month" &&
                <MonthProvider month={statisticsMonth} setMonth={setStatisticsMonth} setYear={setStatisticsYear}>
                    <MonthPaginator monthStr="月" cssStr="mt-2 ml-4 font-bold"/>
                </MonthProvider>
            }
            <div className="flex justify-center">
                {isLoading ? <Loader size={100} isLoading={isLoading} /> :
                 (mode === "year" ? <LineChartComponent expenses={annualHouseholdSummary}/> :
                                    <PieChartComponent expenses={monthlyHouseholdSummary} month={statisticsMonth}/>)
                }
            </div>
        </>
    )
}

export default Statistics