"use client"

//export const runtime = 'edge'

import React, { useState, useContext, useCallback, useEffect } from 'react'
import LineChartComponent from '@components/Chart'
import Loader from '@components/Loader'

import { YearProvider, YearContext } from '@components/YearPicker'
import YearPicker from '@components/YearPicker'

import APIClient from '@utils/api_client'
import { HouseholdMonthlySummaryResponse } from "@utils/constants"


const client = new APIClient()


const Statistics = () => {

    const [monthlyHouseholdSummary, setMonthlyHouseholdSummary] = useState<HouseholdMonthlySummaryResponse>([])

    const { year } = useContext(YearContext)
    const [statisticsYear, setStatisticsYear] = useState(year)
    const [isLoading, setIsLoading] = useState(true)

    const fetchMonthlyHousehold = useCallback(async () => {
        const res = await client.get<HouseholdMonthlySummaryResponse>(`/v2/completed_household/monthly_summary/${statisticsYear}`)
        if (res.data) {
            setMonthlyHouseholdSummary(res.data)
            setIsLoading(false)
        }
    }, [statisticsYear])

    useEffect(() => {
        fetchMonthlyHousehold()
    }, [fetchMonthlyHousehold])

    return (
        <>
            <h1 className="text-2xl font-bold mc-4">🛀 統計 🛀</h1>

            <YearProvider year={statisticsYear} setYear={setStatisticsYear}>
                <YearPicker/>
            </YearProvider>
            <div className="flex justify-center">
                {isLoading ? <Loader size={100} isLoading={isLoading} /> : <LineChartComponent expenses={monthlyHouseholdSummary}/>}
            </div>
        </>
    )
}

export default Statistics