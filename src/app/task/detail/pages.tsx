"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import DOMPurify from 'dompurify'
import APIClient from '@utils/api_client'
import { TaskData, TaskCommentData } from '@utils/constants'


const client = new APIClient()


const TaskDetail = () => {
    const [taskDetail, setTaskDetail] = useState<TaskData>({id: 0, title: "", status: 0, priority: 0, description: "", created_by: 0, updated_at: "", due_date: "", parent_task_id: 0, version: 0})
    const [taskComment, setTaskComment] = useState<TaskCommentData>({id: 0, created_by: 0, updated_at: "", comment: "", task_id: 0, version: 0})
    const param = useSearchParams()
    const id = param.get("id")

    return (
        <></>
    )
}

export default TaskDetail