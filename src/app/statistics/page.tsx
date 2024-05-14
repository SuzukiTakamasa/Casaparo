"use client"

//export const runtime = 'edge'

import React, { useState, useContext, useCallback, useEffect } from 'react'
import LineChartComponent from '@components/Chart'

import { YearProvider, YearContext } from '@components/YearPicker'
import YearPicker from '@components/YearPicker'

import APIClient from '@utils/api_client'
import { HouseholdMonthlySummary } from "@utils/constants"


const client = new APIClient()


const Statistics = () => {

    const [monthlyHouseholdSummary, setMonthlyHouseholdSummary] = useState<HouseholdMonthlySummary[]>([])

    const { year } = useContext(YearContext)
    const [statisticsYear, setStatisticsYear] = useState(year)

    const fetchMonthlyHousehold = useCallback(async () => {
        const res = await client.get<HouseholdMonthlySummary[]>(`/household/monthly_summary/${statisticsYear}`)
        setMonthlyHouseholdSummary(res || [])
    }, [statisticsYear])

    useEffect(() => {
        fetchMonthlyHousehold()
    }, [fetchMonthlyHousehold])

    return (
        <>
        <h1 className="text-2xl font-bold mc-4">🛀 統計 🛀</h1>
            <LineChartComponent expenses={monthlyHouseholdSummary}/>
        </>
    )
}

export default Statistics