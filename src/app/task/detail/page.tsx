"use client"

//export const runtime = 'edge'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import DOMPurify from 'dompurify'
import APIClient from '@utils/api_client'
import { TaskData, TaskResponse, TaskCommentData } from '@utils/constants'
import { setUser, setStatusStr, setPriorityStr } from '@utils/utility_function'


const client = new APIClient()


const TaskDetail = () => {
    const [taskDetail, setTaskDetail] = useState<TaskData>({id: 0, title: "", status: 0, priority: 0, description: "", created_by: 0, updated_at: "", due_date: "", parent_task_id: 0, version: 0})
    const [relatedSubTasks, setRelatedSubTasks] = useState<TaskResponse>([])

    const [showTaskCommentDialog, setShowTaskCommentDialog] = useState(false)
    const [isUpdateTaskComment, setIsUpdateTaskComment] = useState(false)
    const [createdByValidMsg, setCreatedByValidMsg] = useState("")
    const [commentValidMsg, setCommentValidMsg] = useState("")

    const [taskComments, setTaskComments] = useState<TaskCommentData>({id: 0, created_by: 0, updated_at: "", comment: "", task_id: 0, version: 0})
    const [taskCommentId, setTaskCommentId] = useState(0)
    const [createdBy, setCreatedBy] = useState(0)
    const [updatedAt, setUpdatedAt] = useState("")
    const [comment, setComment] = useState("")
    const [taskId, setTaskId] = useState("")
    const [taskCommentVersion, setTaskCommentVersion] = useState(0)

    const param = useSearchParams()
    const id = param.get("id")

    const fetchTaskDetail = useCallback(async () => {
        const res = await client.get<TaskData>(`/v2/task/${id}`)
        if (res.data) {
            setTaskDetail(res.data)
        }
    }, [id])

    const fetchRelatedSubTasks = useCallback(async () => {
        const res = await client.get<TaskResponse>(`/v2/task/related_sub_task/${id}`)
        setRelatedSubTasks(res.data || [])
    }, [id])

    useEffect(() => {
        fetchTaskDetail()
        fetchRelatedSubTasks()
    }, [fetchTaskDetail, fetchRelatedSubTasks])

    return (
        <>
            <div className="container mx-auto p-4 grid place-items-left">
                <div className="text-xl font-bold">{taskDetail.title}</div>
                <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1 mt-1">
                    <div className="bg-black text-white p-2">
                        <div className="border-b border-gray-300">
                            <div className="mb-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeURI(taskDetail.description))}} />
                        </div>
                        <table className="mt-2">
                            <tbody>
                                <tr>
                                    <td className="text-sm pr-4 font-bold">ステータス:</td>
                                    <td className="text-sm">{setStatusStr(taskDetail.status)}</td>
                                </tr>
                                <tr>
                                    <td className="text-sm pr-4 font-bold">優先度:</td>
                                    <td className="text-sm">{setPriorityStr(taskDetail.priority)}</td>
                                </tr>
                                <tr>
                                    <td className="text-sm pr-4 font-bold">作成者:</td>
                                    <td className="text-sm">{setUser(taskDetail.created_by)}</td>
                                </tr>
                                <tr>
                                    <td className="text-sm pr-4 font-bold">期限:</td>
                                    <td className="text-sm">{taskDetail.due_date}</td>
                                </tr>
                            </tbody>
                            <div className="text-xs mt-2">{`(最終更新: ${taskDetail.updated_at})`}</div>
                        </table>
                    </div>
                    <div className="bg-black text-white p-2">
                        <div className="border-b border-gray-300"></div>
                        <div className="mt-2 font-bold">関連サブタスク</div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="text-sm px-4">タイトル</th>
                                    <th className="text-sm px-4">ステータス</th>
                                    <th className="text-sm px-4">優先度</th>
                                    <th className="text-sm px-4">作成者</th>
                                    <th className="text-sm px-4">期限</th>
                                </tr>
                            </thead>
                            <tbody>
                            {relatedSubTasks.map((relatedSubTask, i) => (
                                <tr key={i} className="text-center">
                                    <Link href={`/task/detail?id=${relatedSubTask.id}`} className="text-sm px-1 py-1 text-blue-500 font-bold hover:underline">{relatedSubTask.title}</Link>
                                    <td className="text-sm px-4 py-1">{setStatusStr(relatedSubTask.status)}</td>
                                    <td className="text-sm px-4 py-1">{setPriorityStr(relatedSubTask.priority)}</td>
                                    <td className="text-sm px-4 py-1">{setUser(relatedSubTask.created_by)}</td>
                                    <td className="text-sm px-4 py-1">{relatedSubTask.due_date}</td>
                                    <div className="text-xs mt-1">{`(最終更新: ${relatedSubTask.updated_at})`}</div>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TaskDetail