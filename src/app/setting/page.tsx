"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'

import { LabelData, LabelResponse } from '@utils/constants'
import { PencilIcon, TrashBoxIcon } from '@components/HeroicIcons'
import APIClient from '@utils/api_client'


const client = new APIClient()


const Setting = () => {
    const [showLabelDialog, setShowLabelDialog] = useState(false)
    const [isUpdateLabel, setIsUpdateLabel] = useState(false)

    const [labels, setLabels] = useState<LabelResponse>([])
    const [labelId, setLabelId] = useState(0)
    const [labelName, setLabelName] = useState("")
    const [newLabel, setNewLabel] = useState("")
    const [labelVersion, setLabelVersion] = useState(1)

    const handleAddLabel = () => {
        addlabels()
        handleCloseLabelDialog()
    }
    const handleUpdateLabel = () => {
        updateLabels()
        handleCloseLabelDialog()
    }
    const handleOpenAddLabelDialog = () => {
        setShowLabelDialog(true)
    }
    const handleOpenUpdateLabelDialog = ({id, name, label, version}: LabelData) => {
        setShowLabelDialog(true)
        setLabelId(id as number)
        setLabelName(name)
        setNewLabel(label)
        setLabelVersion(version)
        setIsUpdateLabel(true)
    }
    const handleCloseLabelDialog = () => {
        setShowLabelDialog(false)
        setLabelId(0)
        setLabelName("")
        setNewLabel("")
        setLabelVersion(1)
        setIsUpdateLabel(false)
    }
    const fetchLabels = useCallback(async () => {
        const labels = await client.get<LabelResponse>("/label")
        setLabels(labels || [])
    }, [])
    const addlabels = async () => {
        const addedLabelData = {
            name: labelName,
            label: newLabel,
            version: labelVersion
        }
        const res = await client.post<LabelResponse>('/label/create', addedLabelData)
        await fetchLabels()
    }
    const updateLabels = async () => {
        const updatedLabelData = {
            id: labelId,
            name: labelName,
            label: newLabel,
            version: labelVersion
        }
        const res = await client.post<LabelResponse>('/label/update', updatedLabelData)
        await fetchLabels()
    }
    const deleteLabel = async (deleteLabelData: LabelData) => {
        if (!window.confirm("削除しますか？")) return
        const res = await client.post<LabelResponse>('/label/delete', deleteLabelData)
        await fetchLabels()
    }
    
    useEffect(() => {
        fetchLabels()
    }, [fetchLabels])

    return (
        <>
        <h1 className="text-2xl font-bold mc-4">🦵 設定 🦵</h1>

        <div className="container mx-auto p-4">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={handleOpenAddLabelDialog}
            >
            ラベルを登録
            </button>

            {showLabelDialog && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded">
                        <div className="flex flex-col space-y-4 mb-4">
                            <input 
                                className="border p-2 text-black"
                                type="text"
                                placeholder="ラベル"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                            />
                            <input
                                className="border p-2 text-black"
                                type="text"
                                placeholder="ラベル名"
                                value={labelName}
                                onChange={(e) => setLabelName(e.target.value)}                       
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={isUpdateLabel ? handleUpdateLabel : handleAddLabel}
                            >
                                {isUpdateLabel ? "変更" : "登録"}
                            </button>
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleCloseLabelDialog}
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
                        <th className="border-b-2 py-1"></th>
                        <th className="border-b-2 py-1">ラベル</th>
                        <th className="border-b-2 py-1">ラベル名</th>
                    </tr>
                </thead>
                <tbody>
                    {labels.map((label, i) => (
                        <tr key={i}>
                            <td className="border-b py-1 flex-row justify-center items-center space-x-1">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded"
                                    onClick={() => handleOpenUpdateLabelDialog({
                                        id: label.id,
                                        name: label.name,
                                        label: label.label,
                                        version: label.version
                                    })}
                                >
                                    <PencilIcon />
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                    onClick={() => deleteLabel({
                                        id: label.id,
                                        name: label.name,
                                        label: label.label,
                                        version: label.version
                                    })}
                                >
                                    <TrashBoxIcon />
                                </button>
                            </td>
                            <td className="border-b px-1 py-1 text-center">{label.label}</td>
                            <td className="border-b px-1 py-1 text-center">{label.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    )
}

export default Setting