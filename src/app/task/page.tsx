"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import { YearContext } from '@components/YearPicker'
import { MonthContext } from '@components/MonthPaginator'
import { PencilIcon, TrashBoxIcon } from '@components/HeroicIcons'

import APIClient from '@utils/api_client'
import { TaskData, TaskResponse } from '@utils/constants'
import { setUser, setStatusStr, setPriorityStr, getToday, getNumberOfDays, getWeekDay, getMonthArray, getCurrentDateTime } from '@utils/utility_function'
import { ReactQuillStyles } from '@utils/styles'


const ReactQuill = dynamic(() => import('react-quill'))

const client = new APIClient()


const Task = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    const [titleValidMsg, setTitleValidMsg] = useState("")
    const [descriptionValidMsg, setDescriptionValidMsg] = useState("")
    const [createdByValidMsg, setCreatedByValidMsg] = useState("")
    const [dueDateValidMsg, setDueDateValidMsg] = useState("")

    const { month } = useContext(MonthContext)
    const { year } = useContext(YearContext)

    const today = getToday()

    const [dueDateYear, setDueDateYear] = useState(year)
    const [dueDateMonth, setDueDateMonth] = useState(month)
    const [dueDateDay, setDueDateDay] = useState(today)

    const numberOfDays = getNumberOfDays(dueDateYear, dueDateMonth)

    const [monthDaysArray, setMonthDaysArray] = useState<number[]>([])
    
    const [tasks, setTasks] = useState<TaskResponse>([])
    const [id, setId] = useState(0)
    const [title, setTitle] = useState("")
    const [status, setStatus] = useState(0)
    const [priority, setPriority] = useState(0)
    const [description, setDescription] = useState("")
    const [createdByT, setCreatedByT] = useState(false)
    const [createdByY, setCreatedByY] = useState(false)
    const [createdBy, setCreatedBy] = useState<number|null>(null)
    const [dueDate, setDueDate] = useState("")
    const [parentTaskId, setParentTaskId] = useState(0)
    const [version, setVersion] = useState(0)

    const getDate = (year: number, month: number, day: number) => {
        return new Date(year, month, day)
    }

    const validate = () => {
        let isValid = true
        if (title === "") {
            isValid = false
            setTitleValidMsg("タイトルを入力してください。")
        }
        if (description === "") {
            isValid = false
            setDescriptionValidMsg("内容を入力してください。")
        }
        if (createdBy === null && !createdByT && !createdByY) {
            isValid = false
            setCreatedByValidMsg("いずれかまたは両方の登録者を選択してください。")
        }
        if (getDate(year, month, today) > getDate(dueDateYear, dueDateMonth, dueDateDay)) {
            isValid = false
            setDueDateValidMsg("本日より後の日付を設定してください。")
        }
        return isValid
    }
    const handleSetDescription = (value: string) => {
        setDescription(value)
    }
    const handleSetCreatedBy = useCallback(() => {
        if (createdByT && createdByY) {
            return 2
        } else if (createdByT && !createdByY) {
            return 1
        } else if (!createdByT && createdByY) {
            return 0
        }
        return null
    }, [createdByT, createdByY])
    const handleSetCreatedByTAndY = (value: number) => {
        setCreatedBy(value)
        switch (value) {
            case 2:
                setCreatedByT(true)
                setCreatedByY(true)
                break
            case 1:
                setCreatedByT(true)
                setCreatedByY(false)
                break
            case 0:
                setCreatedByT(false)
                setCreatedByY(true)
                break
        }
    }
    const handleAddTask = async () => {
        if (!validate()) return
        await addTask()
        handleCloseDialog()
    }
    const handleUpdateTask = async () => {
        if (!validate()) return
        await updateTask()
        handleCloseDialog()
    }
    const handleOpenAddDialog = () => {
        setShowDialog(true)
    }
    const handleOpenUpdateDialog = ({id, title, status, priority, description, created_by, due_date, parent_task_id, version}: TaskData) => {
        setShowDialog(true)
        setIsUpdate(true)
        setId(id as number)
        setTitle(title)
        setStatus(status)
        setPriority(priority)
        setDescription(decodeURI(description))
        handleSetCreatedByTAndY(created_by)
        setDueDate(due_date)
        setParentTaskId(parent_task_id)
        setVersion(version)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setIsUpdate(false)
        setId(0)
        setTitle("")
        setStatus(0)
        setPriority(0)
        setDescription("")
        setCreatedBy(0)
        setDueDate("")
        setParentTaskId(0)
        setVersion(0)
        setDescriptionValidMsg("")
        setCreatedByValidMsg("")
        setDueDateValidMsg("")
    }
    const fetchTasks = useCallback(async () => {
        const tasks = await client.get<TaskResponse>('/v2/task')
        setTasks(tasks.data|| [])
    }, [])
    const addTask = async() => {
        const addTaskData = {
            title: title,
            status: status,
            priority: priority,
            description: encodeURI(description),
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            due_date: dueDate,
            parent_task_id: parentTaskId,
            version: version
        } as TaskData
        await client.post('/v2/task/create', addTaskData)
        await fetchTasks()
    }
    const updateTask = async () => {
        const updateTaskData = {
            id: id,
            title: title,
            status: status,
            priority: priority,
            description: encodeURI(description),
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            due_date: dueDate,
            parent_task_id: parentTaskId,
            version: version
        } as TaskData
        await client.post('/v2/task/update', updateTaskData)
        await fetchTasks()
    }
    const deleteTask = async (deletedTaskData: TaskData) => {
        if (!window.confirm("削除しますか？")) return
        await client.post('/v2/task/delete', deletedTaskData)
        await fetchTasks()
    }
    const handleGenerateMonthDaysArray = useCallback(() => {
        setMonthDaysArray([])
        const darr = []
            for (let d = 1; d <= numberOfDays; d++) {
                darr.push(d)
            }
        setMonthDaysArray(darr)
    }, [dueDateYear, dueDateMonth])
    const handleSetDueDate = useCallback(() => {
        setDueDate(`${dueDateYear}/${dueDateMonth}/${dueDateDay}`)
    }, [dueDateYear, dueDateMonth, dueDateDay])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    useEffect(() => {
        handleGenerateMonthDaysArray()
        handleSetDueDate()
    }, [handleGenerateMonthDaysArray, handleSetDueDate])

    useEffect(() => {
        const newCreatedBy = handleSetCreatedBy()
        setCreatedBy(newCreatedBy)
    }, [createdByT, createdByY, handleSetCreatedBy])

    return (
    <>
        <h1 className="text-2xl font-bold mc-4">🛏️ タスク 🛏️</h1>

        <div className="container mx-auto p-4">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={handleOpenAddDialog}
            >
            登録
            </button>

            {showDialog && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded flex flex-col">
                        <input
                            className="border p-2 text-black"
                            type="text"
                            placeholder="タイトル"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                        {titleValidMsg !== "" && <div className="text-sm text-red-500">{titleValidMsg}</div>}
                        <ReactQuill
                            className="mt-2 text-black"
                            value={description}
                            onChange={handleSetDescription}
                            modules={ReactQuillStyles.modules}
                            formats={ReactQuillStyles.formats}
                        />
                        {descriptionValidMsg !== "" && <div className="text-sm text-red-500">{descriptionValidMsg}</div>}
                        <div className="mt-2 text-black">優先度</div>
                        <label className="text-black">
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={priority}
                                onChange={e => setPriority(Number(e.target.value))}
                            >
                                <option value="0">低</option>
                                <option value="1">中</option>
                                <option value="2">高</option>
                            </select>
                        </label>
                        <div className="mt-2 text-black">期限</div>
                        <div className="flex justify-center">
                        <label className="text-black">
                            <span>年</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={dueDateYear}
                                onChange={e => setDueDateYear(Number(e.target.value))}
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
                                value={dueDateMonth}
                                onChange={e => setDueDateMonth(Number(e.target.value))}
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
                                value={dueDateDay}
                                onChange={e => setDueDateDay(Number(e.target.value))}
                            >
                                {monthDaysArray.map((d, i) => (
                                    <option key={i} value={d}>{`${d}日(${getWeekDay(dueDateYear, dueDateMonth, d)})`}</option>
                                ))}
                            </select>
                        </label>
                        </div>
                        {dueDateValidMsg !== "" && <div className="text-sm text-red 500">{dueDateValidMsg}</div>}
                        <label className="text-black">
                            <span>親チケット</span>
                            <select
                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                value={parentTaskId}
                                onChange={e => setParentTaskId(Number(e.target.value))}
                            >
                                <option value="0">なし</option>
                                {tasks.map((t, i) => (
                                    <option key={i} value={t.id}>{`${t.id}: ${t.title}`}</option>
                                ))}
                            </select>
                        </label>
                        <div className="text-black my-2">作成者</div>
                        <div className="text-3xl text-center">
                            <input
                                type="checkbox"
                                checked={createdByT}
                                onClick={() => setCreatedByT(!createdByT)}
                                />
                            <span className="mr-8">🥺</span>
                            <input
                                type="checkbox"
                                checked={createdByY}
                                onClick={() => setCreatedByY(!createdByY)}
                                />
                            <span>🥺ྀི</span>
                        </div>
                        {createdByValidMsg !== "" && <div className="text-sm text-red 500">{createdByValidMsg}</div>}
                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={isUpdate ? handleUpdateTask : handleAddTask}
                            >
                            {isUpdate ? "変更" : "登録"}
                            </button>
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleCloseDialog}
                            >
                            キャンセル
                            </button>
                        </div>  
                    </div>
                </div>
            )}

            <table className="table-auto min-w-full mt-4">
                <thead>
                    <tr>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm"></th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm">タイトル</th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm">ステータス</th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm">優先度</th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm">作成者</th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm">期限</th>                  
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task, i) => (
                        <tr key={i}>
                            <td className="border-b py-1 flex-row justify-center items-center space-x-1">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-blod py-1 px-1 rounded"
                                    onClick={() => handleOpenUpdateDialog({
                                        id: task.id,
                                        title: task.title,
                                        status: task.status,
                                        priority: task.priority,
                                        description: task.description,
                                        created_by: task.created_by,
                                        updated_at: task.updated_at,
                                        due_date: task.due_date,
                                        parent_task_id: task.parent_task_id,
                                        version:task.version
                                    })}
                                >
                                    <PencilIcon />
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                    onClick={() => deleteTask({
                                        id: task.id,
                                        title: task.title,
                                        status: task.status,
                                        priority: task.priority,
                                        description: task.description,
                                        created_by: task.created_by,
                                        updated_at: task.updated_at,
                                        due_date: task.due_date,
                                        parent_task_id: task.parent_task_id,
                                        version:task.version
                                    })}
                                >
                                    <TrashBoxIcon />
                                </button>
                            </td>
                            <td className="border-b px-1 py-1 text-center text-sm">
                                <Link href={`/task/detail?id=${task.id}`} className="text-blue-500 font-bold hover:underline">{task.title}</Link>
                                <div className="text-xs">{`(最終更新: ${task.updated_at})`}</div>
                            </td>
                            <td className="border-b px-1 py-1 text-center text-sm">{setStatusStr(task.status)}</td>
                            <td className="border-b px-1 py-1 text-center text-sm">{setPriorityStr(task.priority)}</td>
                            <td className="border-b px-1 py-1 text-center text-sm">{setUser(task.created_by)}</td>
                            <td className="border-b px-1 py-1 text-center text-xs">{task.due_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
    )
}

export default Task
