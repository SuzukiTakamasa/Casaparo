"use client"

//export const runtime = 'edge'

import React, { useState } from 'react'
import LineChartComponent from '@components/Chart'

const Statistics = () => {

    const [monthlyHousehold, setMonthlyHousehold] = useState(0)

    const monthlyHouseholdChartData = {
        label: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: []
    }
    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }

    return (
        <h1 className="text-2xl font-bold mc-4">🛀 統計 🛀</h1>
    )
}

export default Statistics