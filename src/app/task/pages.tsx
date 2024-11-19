"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'

import { YearProvider, YearContext } from '@components/YearPicker'
import { MonthProvider, MonthContext } from '@components/MonthPaginator'
import { PencilIcon, TrashBoxIcon, CheckBadgeIcon } from '@components/HeroicIcons'

import APIClient from '@utils/api_client'
import { TaskData, TaskCommentData } from '@utils/constants'
import { setUser, getCurrentDateTime } from '@utils/utility_function'


const client = new APIClient()


const Task = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)

    const { month } = useContext(MonthContext)
    const { year } = useContext(YearContext)

    const [dueDateYear, setSUeDateYear] = useState(0)
    const [dueDateMonth, setDueDateMonth] = useState(0)
    const [dueDateDay, setDueDateDay] = useState(0)
    
    const [id, setId] = useState(0)
    const [title, setTitle] = useState("")
    const [status, setStatus] = useState(0)
    const [priority, setPriority] = useState(0)
    const [description, setescription] = useState("")
    const [createdBy, setCreatedBy] = useState(0)
    const [dueDate, setDueDate] = useState("")
    const [isSubTask, setIsSubTask] = useState(0)
    const [parentTaskId, setParentTaskId] = useState(0)
    const [version, setVersion] = useState(0)

    const today = new Date().getDate()

}

export default Task
