"use client"

//export const runtime = 'edge'

import React, {useState} from 'react'

const Schedule = () => {
    const [description, setDescription] = useState("")
    const [date, setDate] = useState("")
    const [fromTime, setFromTime] = useState("")
    const [toTime, setToTime] = useState("")
    const [version, setVersion] = useState(1)

    return (
        <h1 className="text-2xl font-bold mc-4">🦀 スケジュール 🦀</h1>
    )
}

export default Schedule