"use client"

//export const runtime = 'edge'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import DOMPurify from 'dompurify'

import { PencilIcon, TrashBoxIcon } from '@components/HeroicIcons'

import APIClient from '@utils/api_client'
import { TaskData, TaskResponse, TaskCommentData, TaskCommentResponse } from '@/app/utils/interfaces'
import { setUser, setStatusStr, setPriorityStr, getCurrentDateTime } from '@utils/utility_function'


const client = new APIClient()


const TaskDetail = () => {
    const [taskDetail, setTaskDetail] = useState<TaskData>({id: 0, title: "", status: 0, priority: 0, description: "", created_by: 0, updated_at: "", due_date: "", parent_task_id: 0, version: 0})
    const [relatedSubTasks, setRelatedSubTasks] = useState<TaskResponse>([])

    const [showTaskCommentDialog, setShowTaskCommentDialog] = useState(false)
    const [isUpdateTaskComment, setIsUpdateTaskComment] = useState(false)
    const [commentValidMsg, setCommentValidMsg] = useState("")

    const [taskComments, setTaskComments] = useState<TaskCommentResponse>([])
    const [taskCommentId, setTaskCommentId] = useState(0)
    const [createdBy, setCreatedBy] = useState(1)
    const [comment, setComment] = useState("")
    const [taskCommentVersion, setTaskCommentVersion] = useState(0)

    const param = useSearchParams()
    const id = param.get("id")

    const validateTaskComment = () => {
        let isValid = true
        if (comment === "") {
            isValid = false
            setCommentValidMsg("コメントを入力してください。")
        }
        return isValid
    }

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

    const handleAddTaskComment = async () => {
        if (!validateTaskComment()) return
        await addTaskComment()
        handleCloseTaskCommentDialog()
    }
    const handleUpdateTaskComment = async () => {
        if (!validateTaskComment()) return
        await updateTaskComment()
        handleCloseTaskCommentDialog()
    }
    const handleOpenTaskCommentDialog = () => {
        setShowTaskCommentDialog(true)
    }
    const handleOpenUpdateTaskCommentDialog = ({id, created_by, comment, version}: TaskCommentData) => {
        setShowTaskCommentDialog(true)
        setTaskCommentId(id as number)
        setCreatedBy(created_by)
        setComment(decodeURI(comment))
        setTaskCommentVersion(version)
        setIsUpdateTaskComment(true)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    } 
    const handleCloseTaskCommentDialog = () => {
        setShowTaskCommentDialog(false)
        setTaskCommentId(0)
        setCreatedBy(1)
        setComment("")
        setTaskCommentVersion(0)
    }
    const fetchTaskComments = useCallback(async () => {
        const taskComments = await client.get<TaskCommentResponse>(`/v2/task_comment/${id}`)
        setTaskComments(taskComments.data || [])
    }, [id])
    const addTaskComment = async () => {
        const addedTaskCommentData = {
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            comment: encodeURI(comment),
            task_id: Number(id),
            version: taskCommentVersion
        }
        await client.post<TaskCommentData>('/v2/task_comment/create', addedTaskCommentData)
        await fetchTaskComments()
    }
    const updateTaskComment = async () => {
        const updatedTaskCommentData = {
            id: taskCommentId,
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            comment: encodeURI(comment),
            task_id: Number(id),
            version: taskCommentVersion
        }
        await client.post<TaskCommentData>('/v2/task_comment/update', updatedTaskCommentData)
        await fetchTaskComments()
    }
    const deleteTaskComment = async (deletedTaskComment: TaskCommentData) => {
        if (!window.confirm("削除しますか?")) return
        await client.post<TaskCommentData>('/v2/task_comment/delete', deletedTaskComment)
        await fetchTaskComments()
    }

    useEffect(() => {
        fetchTaskDetail()
        fetchRelatedSubTasks()
        fetchTaskComments()
    }, [fetchTaskDetail, fetchRelatedSubTasks, fetchTaskComments])

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
                        <div className="mt-2 text-sm font-bold">関連サブタスク</div>
                            {relatedSubTasks.map((relatedSubTask, i) => (
                                <div key={i} className="flex justify-left">
                                    <Link href={`/task/detail?id=${relatedSubTask.id}`} className="text-sm px-1 py-1 text-blue-500 font-bold hover:underline">
                                        {relatedSubTask.title}
                                    </Link>
                                    <div className="ml-4 text-sm px-1 py-1">{setStatusStr(relatedSubTask.status)}</div>
                                </div>
                            ))}
                    </div>
                </div>
                <div className="flex justify-left mt-2">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                    onClick={handleOpenTaskCommentDialog}
                >
                コメントを追加
                </button>
                </div>
                {taskComments.map((taskComment, i) => (
                    <>
                        <div key={i} className="flex justify-left space-x-2">
                            <div>{setUser(taskComment.created_by)}</div>
                            <div className="rounded-lg overflow-hidden shadow-lg bg-green-500 p-1">
                                <div className="">{decodeURI(taskComment.comment)}</div>
                                <div className="flex justify-right space-x-1">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-blod py-1 px-1 rounded"
                                        onClick={() => handleOpenUpdateTaskCommentDialog({
                                            id: taskComment.id,
                                            created_by: taskComment.created_by,
                                            updated_at: taskComment.updated_at,
                                            comment: taskComment.comment,
                                            task_id: taskComment.task_id,
                                            version:taskComment.version
                                        })}
                                    >
                                        <PencilIcon />
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                        onClick={() => deleteTaskComment({
                                            id: taskComment.id,
                                            created_by: taskComment.created_by,
                                            updated_at: taskComment.updated_at,
                                            comment: taskComment.comment,
                                            task_id: taskComment.task_id,
                                            version:taskComment.version
                                        })}
                                    >
                                        <TrashBoxIcon />
                                    </button>
                                    <div className="text-xs ml-1 mt-2">{`(最終更新: ${taskComment.updated_at})`}</div>
                                </div>
                            </div>
                        </div>
                    </>
                ))}
            </div>
            {showTaskCommentDialog && (
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded">
                            <div className="flex flex-col space-y-4 mb-4">
                                <textarea
                                    className="border p-2 text-black"
                                    placeholder="コメント"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                >
                                </textarea>
                                {commentValidMsg !== "" && <div className="text-sm text-red-500">{commentValidMsg}</div>}
                                <div className="text-black">登録者</div>
                                <div className="text-3xl text-center">
                                    <input
                                        type="radio"
                                        value="1"
                                        checked={createdBy === 1}
                                        onChange={e => setCreatedBy(Number(e.target.value))}
                                        />
                                        <span className="mr-8">🥺</span>
                                    <input
                                        type="radio"
                                        value="0"
                                        checked={createdBy === 0}
                                        onChange={e => setCreatedBy(Number(e.target.value))}
                                        />
                                        <span>🥺ྀི</span>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={isUpdateTaskComment ? handleUpdateTaskComment : handleAddTaskComment}
                                >
                                    {isUpdateTaskComment ? "変更" : "登録"}
                                </button>
                                <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleCloseTaskCommentDialog}
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </>
    )
}

export default TaskDetail