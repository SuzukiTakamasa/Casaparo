"use client"

//export const runtime = 'edge'

import React, { useState } from 'react'
import { ToasterComponent, APIResponseToast } from '@components/ToastMessage'
import { Result } from '@utils/interfaces'
import { PageTitle } from '@components/Title'
import { HorizontallyScrollableTable } from '@components/HorizontallyScrollableTable'
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
            <PageTitle title={"🛠️ 開発者パッチ 🛠️"} />
            <HorizontallyScrollableTable>
                <thead>
                    <tr>
                        <th className="border-b-2 px-4 py-2 whitespace-nowrap">ID</th>
                        <th className="border-b-2 px-4 py-2 whitespace-nowrap">説明</th>
                        <th className="border-b-2 px-4 py-2 whitespace-nowrap"></th>
                    </tr>
                </thead>
                <tbody>
                    {patchList.map((patch, i) => (
                        <tr key={i}>
                            <td className="border-b px-4 py-1 text-center whitespace-nowrap">{patch.id}</td>
                            <td className="border-b px-1 py-1 text-center">{patch.description}</td>
                            <td className="border-b py-1 flex-row justify-center items-center space-x-1 whitespace-nowrap">
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
            </HorizontallyScrollableTable>
            <ToasterComponent />
        </>
    )
}

export default Patch