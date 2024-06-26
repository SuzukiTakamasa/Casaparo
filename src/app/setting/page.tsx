"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useCallback } from 'react'

import { LabelData, LabelResponse, AnniversaryData, AnniversaryResponse } from '@utils/constants'
import { PencilIcon, TrashBoxIcon } from '@components/HeroicIcons'
import APIClient from '@utils/api_client'
import { getMonthArray, getDateArray } from '@utils/utility_function'


const client = new APIClient()


const Setting = () => {
    const [showLabelDialog, setShowLabelDialog] = useState(false)
    const [isUpdateLabel, setIsUpdateLabel] = useState(false)

    const [labels, setLabels] = useState<LabelResponse>([])
    const [labelId, setLabelId] = useState(0)
    const [labelName, setLabelName] = useState("")
    const [newLabel, setNewLabel] = useState("")
    const [labelVersion, setLabelVersion] = useState(1)

    const [showAnniversaryDialog, setShowAnniversaryDialog] = useState(false)
    const [isUpdateAnniversary, setIsUpdateAnniversary] = useState(false)

    const [anniversaries, setAnniversaries] = useState<AnniversaryResponse>([])
    const [anniversaryId, setAnniversaryId] = useState(0)
    const [anniversaryMonth, setAnniversaryMonth] = useState(1)
    const [anniversaryDate, setAnniversaryDate] = useState(1)
    const [anniversaryDescription, setAnniversaryDescription] = useState("")
    const [anniversaryVersion, setAnniversaryVersion] = useState(1)
    

    const handleAddLabel = async () => {
        await addlabels()
        handleCloseLabelDialog()
    }
    const handleUpdateLabel = async () => {
        await updateLabels()
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
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
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

    const handleAddAnniversary = async () => {
        await addAnniversary()
        handleCloseAnniversaryDialog()
    }
    const handleUpdateAnniversary = async () => {
        await UpdateAnniversary()
        handleCloseAnniversaryDialog()
    }
    const handleOpenAddAnniversaryDialog = async () => {
        setShowAnniversaryDialog(true)
    }
    const handleOpenUpdateAnniversaryDialog = async ({id, month, date, description, version}: AnniversaryData) => {
        setShowAnniversaryDialog(true)
        setAnniversaryId(id as number)
        setAnniversaryMonth(month)
        setAnniversaryDate(date)
        setAnniversaryDescription(description)
        setAnniversaryVersion(version)
        setIsUpdateAnniversary(true)
        window.scroll({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseAnniversaryDialog = () => {
        setShowAnniversaryDialog(false)
        setAnniversaryId(0)
        setAnniversaryMonth(1)
        setAnniversaryDate(1)
        setAnniversaryDescription("")
        setAnniversaryVersion(1)
        setIsUpdateAnniversary(false)
    }

    const fetchAnniversaries = useCallback(async () => {
        const anniversaries = await client.get<AnniversaryResponse>('/anniversary')
        setAnniversaries(anniversaries || [])
    }, [])
    const addAnniversary = async () => {
        const addAnniversaryData = {
            month: anniversaryMonth,
            date: anniversaryDate,
            description: anniversaryDescription,
            version: anniversaryVersion
        }
        const res = await client.post<AnniversaryResponse>('/anniversary/create', addAnniversaryData)
        await fetchAnniversaries()
    }
    const UpdateAnniversary = async () => {
        const updateAnniversaryData = {
            id: anniversaryId,
            month: anniversaryMonth,
            date: anniversaryDate,
            description: anniversaryDescription,
            version: anniversaryVersion
        }
        const res = await client.post<AnniversaryResponse>('/anniversary/update', updateAnniversaryData)
        await fetchAnniversaries()
    }
    const deleteAnniversary = async (deleteAnniversaryData: AnniversaryData) => {
        if (!window.confirm("削除しますか？")) return
        const res = await client.post<AnniversaryResponse>('/anniversary/delete', deleteAnniversaryData)
        await fetchAnniversaries()
    }
    
    useEffect(() => {
        fetchLabels()
        fetchAnniversaries()
    }, [fetchLabels, fetchAnniversaries])

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
            <div className="container mx-auto p-4">
                <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                        onClick={handleOpenAddAnniversaryDialog}
                    >
                記念日を登録
                </button>

                {showAnniversaryDialog && (
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded">
                            <div className="flex flex-col space-y-4 mb-4">
                                <div className="flex justify-center">
                                    <label className="text-black">
                                        <span>月</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={anniversaryMonth}
                                            onChange={e => setAnniversaryMonth(Number(e.target.value))}
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
                                            value={anniversaryDate}
                                            onChange={e => setAnniversaryDate(Number(e.target.value))}
                                        >
                                            {getDateArray(anniversaryMonth).map((m, i) => (
                                                <option key={i} value={m}>{`${m}日`}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <input
                                    className="border p-2 text-black"
                                    type="text"
                                    placeholder="記念日名"
                                    value={anniversaryDescription}
                                    onChange={e => setAnniversaryDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={isUpdateAnniversary ? handleUpdateAnniversary : handleAddAnniversary}
                                >
                                    {isUpdateLabel ? "変更" : "登録"}
                                </button>
                                <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleCloseAnniversaryDialog}
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <table className="tavle-auto min-w-full mt-4">
                    <thead>
                        <tr>
                            <th className="border-b-2 py-1"></th>
                            <th className="border-b-2 py-1">日付</th>
                            <th className="border-b-2 py-1">記念日</th>
                        </tr>
                    </thead>
                    <tbody>
                        {anniversaries.map((anniversary, i) => (
                            <tr key={i}>
                            <td className="border-b py-1 flex-row justify-center items-center space-x-1">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded"
                                    onClick={() => handleOpenUpdateAnniversaryDialog({
                                        id: anniversary.id,
                                        month: anniversary.month,
                                        date: anniversary.date,
                                        description: anniversary.description,
                                        version: anniversary.version
                                    })}
                                >
                                    <PencilIcon />
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                    onClick={() => deleteAnniversary({
                                        id: anniversary.id,
                                        month: anniversary.month,
                                        date: anniversary.date,
                                        description: anniversary.description,
                                        version: anniversary.version
                                    })}
                                >
                                    <TrashBoxIcon />
                                </button>
                            </td>
                            <td className="border-b px-1 py-1 text-center">{`${anniversary.month}/${anniversary.date}`}</td>
                            <td className="border-b px-1 py-1 text-center">{anniversary.description}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Setting