"use client"

//export const runtime = 'edge'

import React, { useState } from 'react'
import { ToasterComponent, APIResponseToast } from '@components/ToastMessage'
import { APIClient } from '@utils/api_client'
import { Patches } from '@utils/interfaces'

import { WikiData, WikiResponse, TaskData, TaskResponse } from '@utils/interfaces'


const client  = new APIClient()

const Patch = () => {

    // Patch List
    const patchList: Patches<any>[] = [
        {
            id: 1,
            description: "Decode descriptions of wiki",
            function: async () => {
                const response = await client.get<WikiResponse>("/v2/wiki")
                if (response.error)  return { data: null, error: response.error }
                if (!response.data) return { data: null, error: "No data found" }
                const wikis = response.data!
                for (const wiki of wikis) {
                    wiki.content = decodeURI(wiki.content)
                }
                const result = Promise.all(wikis?.map(async (data) => {
                    client.post<WikiData>("/v2/wiki/update", data)
                }))
                return result
            }
        },
        {
            id: 2,
            description: "Decode descriptions of task",
            function: async () => {
                const response = await client.get<TaskResponse>("/v2/wiki")
                if (response.error)  return { data: null, error: response.error }
                if (!response.data) return { data: null, error: "No data found" }
                const tasks = response.data!
                for (const task of tasks) {
                    task.description = decodeURI(task.description)
                }
                const result = Promise.all(tasks?.map(async (data) => {
                    client.post<TaskData>("/v2/task/update", data)
                }))
                return result
            }
        }
    ]
    //

    const [isDone, setIsDone] = useState(Array(patchList.length).fill(false))

    const handleExecutePatch = async (index: number) => {
        const patch = patchList[index]
        if (!window.confirm("パッチを実行しますか？")) {
            return
        }
        const response = await patch.function()
        setIsDone(prev => {
            const newIsDone = [...prev]
            newIsDone[index] = true
            return newIsDone
        })
        APIResponseToast({ data: null, error: null }, "パッチの実行に成功しました", "パッチの実行に失敗しました")
    }

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">🛠️ 開発者パッチ 🛠️</h1>
            <div className="container mx-auto p-4">
                <table className="table-auto min-w-full mt-4">
                    <thead>
                        <tr>
                            <th className="border-b-2 px-4 py-2">ID</th>
                            <th className="border-b-2 px-4 py-2">説明</th>
                            <th className="border-b-2 px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {patchList.map((patch, i) => (
                            <tr key={i}>
                                <td className="border-b px-4 py-1 text-center">{patch.id}</td>
                                <td className="border-b px-1 py-1 text-center">{patch.description}</td>
                                <td className="border-b py-1 flex-row justify-center items-center space-x-1">
                                    <button
                                        className={`text-xl ${isDone[i] ? "bg-gray-700" : "bg-green-700 hover:bg-green-900" } text-white font-bold py-2 px-8 my-2 rounded`}
                                        onClick={() => handleExecutePatch(i)}
                                        disabled={isDone[i]}
                                    >
                                        実行
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToasterComponent />
        </>
    )
}

export default Patch