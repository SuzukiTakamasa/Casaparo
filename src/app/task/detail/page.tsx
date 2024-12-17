"use client"

//export const runtime = 'edge'

import React, { useEffect, useState, useCallback, useContext } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import DOMPurify from 'dompurify'

import { YearContext } from '@components/YearPicker'
import { MonthContext } from '@components/MonthPaginator'
import { PencilIcon, TrashBoxIcon } from '@components/HeroicIcons'

import APIClient from '@utils/api_client'
import { TaskData, TaskResponse, TaskCommentData, TaskCommentResponse } from '@/app/utils/interfaces'
import { setUser, setStatusStr, setPriorityStr, getToday, getDate, getNumberOfDays, getWeekDay, getMonthArray, getCurrentDateTime } from '@utils/utility_function'
import { ReactQuillStyles } from '@utils/styles'


const ReactQuill = dynamic(() => import('react-quill'))

const client = new APIClient()


const TaskDetail = () => {
    const [taskDetail, setTaskDetail] = useState<TaskData>({id: 0, title: "", status: 0, priority: 0, description: "", created_by: 0, updated_at: "", due_date: "", parent_task_id: 0, version: 0})

    const [showTaskCommentDialog, setShowTaskCommentDialog] = useState(false)
    const [isUpdateTaskComment, setIsUpdateTaskComment] = useState(false)
    const [commentValidMsg, setCommentValidMsg] = useState("")

    const [relatedSubTaskTitleValidMsg, setRelatedSubTaskTitleValidMsg] = useState("")
    const [relatedSubTaskDescriptionValidMsg, setRelatedSubTaskDescriptionValidMsg] = useState("")
    const [relatedSubTaskCreatedByValidMsg, setRelatedSubTaskCreatedByValidMsg] = useState("")
    const [relatedSubTaskDueDateValidMsg, setRelatedSubTaskDueDateValidMsg] = useState("")

    const [taskComments, setTaskComments] = useState<TaskCommentResponse>([])
    const [taskCommentId, setTaskCommentId] = useState(0)
    const [taskCommentCreatedBy, setTaskCommentCreatedBy] = useState(1)
    const [comment, setComment] = useState("")
    const [taskCommentVersion, setTaskCommentVersion] = useState(0)

    const { month } = useContext(MonthContext)
    const { year } = useContext(YearContext)

    const today = getToday()

    const [relatedSubTaskDueDateYear, setRelatedSubTaskDueDateYear] = useState(year)
    const [relatedSubTaskDueDateMonth, setRelatedSubTaskDueDateMonth] = useState(month)
    const [relatedSubTaskDueDateDay, setRelatedSubTaskDueDateDay] = useState(today)

    const numberOfDays = getNumberOfDays(relatedSubTaskDueDateYear, relatedSubTaskDueDateMonth)

    const [monthDaysArray, setMonthDaysArray] = useState<number[]>([])

    const [showUpdateRelatedSubTaskDialog, setShowUpdateRelatedSubTaskDialog] = useState(false)
    const [relatedSubTasks, setRelatedSubTasks] = useState<TaskResponse>([])
    const [relatedSubTaskId, setRelatedSubTaskId] = useState(0)
    const [relatedSubTaskTitle, setRelatedSubTaskTitle] = useState("")
    const [relatedSubTaskStatus, setRelatedSubTaskStatus] = useState(0)
    const [relatedSubTaskPriority, setRelatedSubTaskPriority] = useState(0)
    const [relatedSubTaskDescription, setRelatedSubTaskDescription] = useState("")
    const [relatedSubTaskCreatedByT, setRelatedSubTaskCreatedByT] = useState(false)
    const [relatedSubTaskCreatedByY, setRelatedSubTaskCreatedByY] = useState(false)
    const [relatedSubTaskCreatedBy, setRelatedSubTaskCreatedBy] = useState<number|null>(null)
    const [relatedSubTaskDueDate, setRelatedSubTaskDueDate] = useState("")
    const [relatedSubTaskParentTaskId, setRelatedSubTaskParentTaskId] = useState(0)
    const [relatedSubTaskVersion, setRelatedSubTaskVersion] = useState(0)

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

    const validateRelatedSubTask = () => {
        let isValid = true
        if (relatedSubTaskTitle === "") {
            isValid = false
            setRelatedSubTaskTitleValidMsg("タイトルを入力してください。")
        }
        if (relatedSubTaskDescription === "") {
            isValid = false
            setRelatedSubTaskDescriptionValidMsg("内容を入力してください。")
        }
        if (relatedSubTaskCreatedBy === null && !relatedSubTaskCreatedByT && !relatedSubTaskCreatedByY) {
            isValid = false
            setRelatedSubTaskCreatedByValidMsg("いずれかまたは両方の登録者を選択してください。")
        }
        if (getDate(year, month, today) > getDate(relatedSubTaskDueDateYear, relatedSubTaskDueDateMonth, relatedSubTaskDueDateDay)) {
            isValid = false
            setRelatedSubTaskDueDateValidMsg("本日より後の日付を設定してください。")
        }
        return isValid
    }
    const handleSetRelatedSubTaskDescription = (value: string) => {
        setRelatedSubTaskDescription(value)
    }
    const handleSetRelatedSubTaskCreatedBy = useCallback(() => {
        if (relatedSubTaskCreatedByT && relatedSubTaskCreatedByY) {
            return 2
        } else if (relatedSubTaskCreatedByT && !relatedSubTaskCreatedByY) {
            return 1
        } else if (!relatedSubTaskCreatedByT && relatedSubTaskCreatedByY) {
            return 0
        }
        return null
    }, [relatedSubTaskCreatedByT, relatedSubTaskCreatedByY])
    const handleSetRelatedSubTaskCreatedByTAndY = (value: number) => {
        setRelatedSubTaskCreatedBy(value)
        switch (value) {
            case 2:
                setRelatedSubTaskCreatedByT(true)
                setRelatedSubTaskCreatedByY(true)
                break
            case 1:
                setRelatedSubTaskCreatedByT(true)
                setRelatedSubTaskCreatedByY(false)
                break
            case 0:
                setRelatedSubTaskCreatedByT(false)
                setRelatedSubTaskCreatedByY(true)
                break
        }
    }
    const handleUpdateRelatedSubTask = async () => {
        if (!validateRelatedSubTask()) return
        await updateRelatedSubTask()
        handleCloseRelatedSubTaskDialog()
    }
    const handleOpenUpdateRelatedSubTaskDialog = ({id, title, status, priority, description, created_by, due_date, parent_task_id, version}: TaskData) => {
        setShowUpdateRelatedSubTaskDialog(true)
        setRelatedSubTaskId(id as number)
        setRelatedSubTaskTitle(title)
        setRelatedSubTaskStatus(status)
        setRelatedSubTaskPriority(priority)
        setRelatedSubTaskDescription(decodeURI(description))
        handleSetRelatedSubTaskCreatedByTAndY(created_by)
        setRelatedSubTaskDueDate(due_date)
        setRelatedSubTaskParentTaskId(parent_task_id)
        setRelatedSubTaskVersion(version)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseRelatedSubTaskDialog = () => {
        setShowUpdateRelatedSubTaskDialog(false)
        setRelatedSubTaskId(0)
        setRelatedSubTaskTitle("")
        setRelatedSubTaskStatus(0)
        setRelatedSubTaskPriority(0)
        setRelatedSubTaskDescription("")
        setRelatedSubTaskCreatedBy(0)
        setRelatedSubTaskDueDate("")
        setRelatedSubTaskParentTaskId(0)
        setRelatedSubTaskVersion(0)
        setRelatedSubTaskDescriptionValidMsg("")
        setRelatedSubTaskCreatedByValidMsg("")
        setRelatedSubTaskDueDateValidMsg("")
    }
    const fetchRelatedSubTasks = useCallback(async () => {
        const res = await client.get<TaskResponse>(`/v2/task/related_sub_task/${id}`)
        setRelatedSubTasks(res.data || [])
    }, [id])
    const updateRelatedSubTask = async () => {
        const updateTaskData = {
            id: relatedSubTaskId,
            title: relatedSubTaskTitle,
            status: relatedSubTaskStatus,
            priority: relatedSubTaskPriority,
            description: encodeURI(relatedSubTaskDescription),
            created_by: relatedSubTaskCreatedBy as number,
            updated_at: getCurrentDateTime(),
            due_date: relatedSubTaskDueDate,
            parent_task_id: relatedSubTaskParentTaskId,
            version: relatedSubTaskVersion
        }
        await client.post<TaskData>('/v2/task/update', updateTaskData)
        await fetchRelatedSubTasks()
    }
    const deleteRelatedSubTask = async (deletedTaskData: TaskData) => {
        if (!window.confirm("削除しますか？")) return
        await client.post<TaskData>('/v2/task/delete', deletedTaskData)
        await fetchRelatedSubTasks()
    }
    const handleGenerateMonthDaysArray = useCallback(() => {
        setMonthDaysArray([])
        const darr = []
            for (let d = 1; d <= numberOfDays; d++) {
                darr.push(d)
            }
        setMonthDaysArray(darr)
    }, [relatedSubTaskDueDateYear, relatedSubTaskDueDateMonth])
    const handleSetRelatedSubTaskDueDate = useCallback(() => {
        setRelatedSubTaskDueDate(`${relatedSubTaskDueDateYear}/${relatedSubTaskDueDateMonth}/${relatedSubTaskDueDateDay}`)
    }, [relatedSubTaskDueDateYear, relatedSubTaskDueDateMonth, relatedSubTaskDueDateDay])

    const fetchTaskDetail = useCallback(async () => {
        const res = await client.get<TaskData>(`/v2/task/${id}`)
        if (res.data) {
            setTaskDetail(res.data)
        }
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
        setTaskCommentCreatedBy(created_by)
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
        setTaskCommentCreatedBy(1)
        setComment("")
        setTaskCommentVersion(0)
    }
    const fetchTaskComments = useCallback(async () => {
        const taskComments = await client.get<TaskCommentResponse>(`/v2/task_comment/${id}`)
        setTaskComments(taskComments.data || [])
    }, [id])
    const addTaskComment = async () => {
        const addedTaskCommentData = {
            created_by: taskCommentCreatedBy,
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
            created_by: taskCommentCreatedBy,
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
    const handleSetComment = (value: string) => {
        setComment(value)
    }

    useEffect(() => {
        fetchTaskDetail()
        fetchRelatedSubTasks()
        fetchTaskComments()
    }, [fetchTaskDetail, fetchRelatedSubTasks, fetchTaskComments])

    useEffect(() => {
        handleGenerateMonthDaysArray()
        handleSetRelatedSubTaskDueDate()
    }, [handleGenerateMonthDaysArray, handleSetRelatedSubTaskDueDate])

    useEffect(() => {
        const newCreatedBy = handleSetRelatedSubTaskCreatedBy()
        setRelatedSubTaskCreatedBy(newCreatedBy)
    }, [relatedSubTaskCreatedByT, relatedSubTaskCreatedByY, handleSetRelatedSubTaskCreatedBy])

    return (
        <>
            {showUpdateRelatedSubTaskDialog && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded flex flex-col">
                        <input
                            className="border p-2 text-black"
                            type="text"
                            placeholder="タイトル"
                            value={relatedSubTaskTitle}
                            onChange={e => setRelatedSubTaskTitle(e.target.value)}
                        />
                        {relatedSubTaskTitleValidMsg !== "" && <div className="text-sm text-red-500">{relatedSubTaskTitleValidMsg}</div>}
                        <ReactQuill
                            className="mt-2 text-black"
                            value={relatedSubTaskDescription}
                            onChange={handleSetRelatedSubTaskDescription}
                            modules={ReactQuillStyles.modules}
                            formats={ReactQuillStyles.formats}
                        />
                        {relatedSubTaskDescriptionValidMsg !== "" && <div className="text-sm text-red-500">{relatedSubTaskDescriptionValidMsg}</div>}
                        <div className="mt-2 text-black">優先度</div>
                        <label className="text-black">
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={relatedSubTaskPriority}
                                onChange={e => setRelatedSubTaskPriority(Number(e.target.value))}
                            >
                                <option value="0">低</option>
                                <option value="1">中</option>
                                <option value="2">高</option>
                            </select>
                        </label>
                        <div className="mt-2 text-black">ステータス</div>
                        <label className="text-black">
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={relatedSubTaskStatus}
                                onChange={e => setRelatedSubTaskStatus(Number(e.target.value))}
                            >
                                <option value="0">未着手</option>
                                <option value="1">着手中</option>
                                <option value="2">完了</option>
                            </select>
                        </label>
                        <div className="mt-2 text-black">期限</div>
                        <div className="flex justify-center">
                        <label className="text-black">
                            <span>年</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={relatedSubTaskDueDateYear}
                                onChange={e => setRelatedSubTaskDueDateYear(Number(e.target.value))}
                            >
                                <option value={year - 1}>{`${year - 1}年`}</option>
                                <option value={year}>{`${year}年`}</option>
                                <option value={year + 1}>{`${year + 1}年`}</option>
                            </select>
                        </label>
                        <label className="text-black">
                            <span>月</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={relatedSubTaskDueDateMonth}
                                onChange={e => setRelatedSubTaskDueDateMonth(Number(e.target.value))}
                            >
                                {getMonthArray().map((m, i) => (
                                    <option key={i} value={m}>{`${m}月`}</option>
                            ))}
                            </select>
                        </label>
                        <label className="text-black">
                            <span>日</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={relatedSubTaskDueDateDay}
                                onChange={e => setRelatedSubTaskDueDateDay(Number(e.target.value))}
                            >
                                {monthDaysArray.map((d, i) => (
                                    <option key={i} value={d}>{`${d}日(${getWeekDay(relatedSubTaskDueDateYear, relatedSubTaskDueDateMonth, d)})`}</option>
                                ))}
                            </select>
                        </label>
                        </div>
                        {relatedSubTaskDueDateValidMsg !== "" && <div className="text-sm text-red 500">{relatedSubTaskDueDateValidMsg}</div>}
                        <label className="text-black">
                            <span>親チケット</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={relatedSubTaskParentTaskId}
                                onChange={e => setRelatedSubTaskParentTaskId(Number(e.target.value))}
                            >
                                <option value="0">なし</option>
                                {relatedSubTasks.map((t, i) => (
                                    <option key={i} value={t.id}>{`${t.id}: ${t.title}`}</option>
                                ))}
                            </select>
                        </label>
                        <div className="text-black my-2">作成者</div>
                        <div className="text-3xl text-center">
                            <input
                                type="checkbox"
                                checked={relatedSubTaskCreatedByT}
                                onClick={() => setRelatedSubTaskCreatedByT(!relatedSubTaskCreatedByT)}
                                />
                            <span className="mr-8">🥺</span>
                            <input
                                type="checkbox"
                                checked={relatedSubTaskCreatedByY}
                                onClick={() => setRelatedSubTaskCreatedByY(!relatedSubTaskCreatedByY)}
                                />
                            <span>🥺ྀི</span>
                        </div>
                        {relatedSubTaskCreatedByValidMsg !== "" && <div className="text-sm text-red 500">{relatedSubTaskCreatedByValidMsg}</div>}
                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleUpdateRelatedSubTask}
                            >
                            変更
                            </button>
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleCloseRelatedSubTaskDialog}
                            >
                            キャンセル
                            </button>
                        </div>  
                    </div>
                </div>
            )}

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
                                    <div className="space-x-1 mr-4">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-blod py-1 px-1 rounded"
                                            onClick={() => handleOpenUpdateRelatedSubTaskDialog({
                                                id: relatedSubTask.id,
                                                title: relatedSubTask.title,
                                                status: relatedSubTask.status,
                                                priority: relatedSubTask.priority,
                                                description: relatedSubTask.description,
                                                created_by: relatedSubTask.created_by,
                                                updated_at: relatedSubTask.updated_at,
                                                due_date: relatedSubTask.due_date,
                                                parent_task_id: relatedSubTask.parent_task_id,
                                                version: relatedSubTask.version
                                            })}
                                        >
                                            <PencilIcon />
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                            onClick={() => deleteRelatedSubTask({
                                                id: relatedSubTask.id,
                                                title: relatedSubTask.title,
                                                status: relatedSubTask.status,
                                                priority: relatedSubTask.priority,
                                                description: relatedSubTask.description,
                                                created_by: relatedSubTask.created_by,
                                                updated_at: relatedSubTask.updated_at,
                                                due_date: relatedSubTask.due_date,
                                                parent_task_id: relatedSubTask.parent_task_id,
                                                version: relatedSubTask.version
                                            })}
                                        >
                                            <TrashBoxIcon />
                                        </button>
                                    </div>
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
                    <div key={i} className="my-1">
                        <div className="flex justify-left space-x-2">
                            <div className="text-lg">{setUser(taskComment.created_by)}</div>
                            <div className="rounded-lg overflow-hidden shadow-lg bg-green-500 p-1">
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeURI(taskComment.comment))}} />
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
                    </div>
                ))}
            </div>
            {showTaskCommentDialog && (
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded">
                            <div className="flex flex-col space-y-4 mb-4">
                                <ReactQuill
                                    className="text-black"
                                    value={comment}
                                    onChange={handleSetComment}
                                    modules={ReactQuillStyles.modules}
                                    formats={ReactQuillStyles.formats}
                                />
                                {commentValidMsg !== "" && <div className="text-sm text-red-500">{commentValidMsg}</div>}
                                <div className="text-black">登録者</div>
                                <div className="text-3xl text-center">
                                    <input
                                        type="radio"
                                        value="1"
                                        checked={taskCommentCreatedBy === 1}
                                        onChange={e => setTaskCommentCreatedBy(Number(e.target.value))}
                                        />
                                        <span className="mr-8">🥺</span>
                                    <input
                                        type="radio"
                                        value="0"
                                        checked={taskCommentCreatedBy === 0}
                                        onChange={e => setTaskCommentCreatedBy(Number(e.target.value))}
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