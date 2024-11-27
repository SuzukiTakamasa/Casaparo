"use client"

//export const runtime = 'edge'

import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import DOMPurify from 'dompurify'
import APIClient from '@utils/api_client'
import { TaskData, TaskCommentData } from '@utils/constants'
import { setUser, setStatusStr, setPriorityStr } from '@utils/utility_function'


const client = new APIClient()


const TaskDetail = () => {
    const [taskDetail, setTaskDetail] = useState<TaskData>({id: 0, title: "", status: 0, priority: 0, description: "", created_by: 0, updated_at: "", due_date: "", parent_task_id: 0, version: 0})
    const [taskComment, setTaskComment] = useState<TaskCommentData>({id: 0, created_by: 0, updated_at: "", comment: "", task_id: 0, version: 0})
    const param = useSearchParams()
    const id = param.get("id")

    const fetchTaskDetail = useCallback(async () => {
        const res = await client.get<TaskData>(`/v2/task/${id}`)
        if (res.data) {
            setTaskDetail(res.data)
        }
    }, [id])

    useEffect(() => {
        fetchTaskDetail()
    }, [fetchTaskDetail])

    return (
        <>
            <div className="container mx-auto p-4 grid place-items-left">
                <div className="text-xl font-bold">{taskDetail.title}</div>
                <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1 mt-1">
                    <div className="bg-black text-white p-2">
                        <div className="border-b border-gray-300">
                            <div className="mb-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeURI(taskDetail.description))}} />
                        </div>
                        <div className="mt-2 text-sm">{`作成者: ${setUser(taskDetail.created_by)}`}</div>
                        <div className="text-sm">{`ステータス: ${setStatusStr(taskDetail.status)}`}</div>
                        <div className="text-sm">{`優先度: ${setPriorityStr(taskDetail.priority)}`}</div>
                        <div className="text-sm">{`期限: ${taskDetail.due_date}`}</div>
                        <div className="mt-2 text-xs">{`(最終更新: ${taskDetail.updated_at})`}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TaskDetail