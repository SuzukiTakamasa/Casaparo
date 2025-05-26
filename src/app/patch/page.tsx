"use client"

//export const runtime = 'edge'

import React, { useState } from 'react'
import { ToasterComponent, APIResponseToast } from '@components/ToastMessage'
import { Result } from '@utils/interfaces'
import patchList from './patch_list'

const Patch = () => {

    const [isDone, setIsDone] = useState(Array(patchList.length).fill(false))

    const handleExecutePatch = async (index: number) => {
        const patch = patchList[index]
        if (!window.confirm("パッチを実行しますか？")) {
            return
        }
        const response: Result<any> = await patch.function()
        setIsDone(prev => {
            const newIsDone = [...prev]
            newIsDone[index] = true
            return newIsDone
        })
        APIResponseToast({ data: response.data, error: response.error }, "パッチの実行に成功しました", "パッチの実行に失敗しました")
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