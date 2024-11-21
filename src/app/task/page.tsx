"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'
import ReactQuill from 'react-quill'

import { YearProvider, YearContext } from '@components/YearPicker'
import { MonthProvider, MonthContext } from '@components/MonthPaginator'
import { PencilIcon, TrashBoxIcon, CheckBadgeIcon } from '@components/HeroicIcons'

import APIClient from '@utils/api_client'
import { TaskData, TaskResponse } from '@utils/constants'
import { setUser, getCurrentDateTime, boolToInt, intToBool } from '@utils/utility_function'
import { ReactQuillStyles } from '@utils/styles'


const client = new APIClient()

const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 
    'italic', 
    'underline', 
    'strike',
    'list', 
    'bullet',
    'color',
    'background',
    'align',
    'link',
    'image'
  ];


const Task = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    const [titleValidMsg, setTitleValidMsg] = useState("")
    const [descriptionValidMsg, setDescriptionValidMsg] = useState("")
    const [createdByValidMsg, setCreatedByValidMsg] = useState("")
    const [dueDateValidMsg, setDueDateValidMsg] = useState("")

    const { month } = useContext(MonthContext)
    const { year } = useContext(YearContext)

    const [dueDateYear, setDueDateYear] = useState(0)
    const [dueDateMonth, setDueDateMonth] = useState(0)
    const [dueDateDay, setDueDateDay] = useState(0)
    
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
    const [isSubTask, setIsSubTask] = useState(false)
    const [parentTaskId, setParentTaskId] = useState(0)
    const [version, setVersion] = useState(0)

    const today = new Date().getDate()

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
        if (dueDateYear === 0 || dueDateMonth === 0 || dueDateDay === 0) {
            isValid = false
            setDueDateValidMsg("期限の年月日を正しく設定してください。")
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
    const handleOpenUpdateDialog = ({id, title, status, priority, description, created_by, due_date, is_sub_task, parent_task_id, version}: TaskData) => {
        setShowDialog(true)
        setId(id as number)
        setTitle(title)
        setStatus(status)
        setPriority(priority)
        setDescription(description)
        setCreatedBy(created_by)
        setDueDate(due_date)
        setIsSubTask(intToBool(is_sub_task))
        setParentTaskId(parent_task_id)
        setVersion(version)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setId(0)
        setTitle("")
        setStatus(0)
        setPriority(0)
        setDescription("")
        setCreatedBy(0)
        setDueDate("")
        setIsSubTask(false)
        setParentTaskId(0)
        setVersion(0)
    }
    const fetchTasks = useCallback(async () => {
        const tasks = await client.get<TaskResponse>('/v2/task')
        setTasks(tasks.data || [])
    }, [])
    const addTask = async() => {
        const addTaskData = {
            title: title,
            status: status,
            priority: priority,
            description: description,
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            due_date: dueDate,
            is_sub_task: boolToInt(isSubTask),
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
            description: description,
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            due_date: dueDate,
            is_sub_task: boolToInt(isSubTask),
            parent_task_id: parentTaskId,
            version: version
        } as TaskData
        await client.post('/v2/task/update', updateTaskData)
        await fetchTasks()
    }
    const deleteTask = async (deletedTaskData: TaskData) => {
        if (!window.confirm("削除しますか？")) return
        await client.post('/v2/task/delete', deletedTaskData)
        await fetchTasks
    }

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

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
                    <div className="bg-white p-4 rounded">
                        <input
                            className="border p-2 text-black"
                            type="text"
                            placeholder="タイトル"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                        {titleValidMsg !== "" && <div className="text-sm text-red 500">{titleValidMsg}</div>}
                        <ReactQuill
                            className="my-2 text-black"
                            value={description}
                            onChange={handleSetDescription}
                            modules={ReactQuillStyles.modules}
                            formats={ReactQuillStyles.formats}
                        />
                        {descriptionValidMsg !== "" && <div className="text-sm text-red 500">{descriptionValidMsg}</div>}
                        <div className="text-black">作成者</div>
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
        </div>
    </>
    )
}

export default Task
