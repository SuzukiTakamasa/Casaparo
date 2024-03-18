"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'

import { LabelData, LabelResponse } from '@utils/constants'
import APIClient from '@utils/api_client'


const client = new APIClient()


const Setting = () => {
    const [showlabeDialog, setShowLabelDialog] = useState(false)
    const [isUpdateLabel, setIsUpdateLabel] = useState(false)

    const [labels, setLabels] = useState<LabelResponse>([])
    const [labelId, setLabelId] = useState(0)
    const [labelName, setLabelName] = useState("")
    const [newLabel, setNewLabel] = useState("")
    const [labelVersion, setLabelVersion] = useState(1)

    const handleAddLabel = () => {
        addlabels()
        handleCloselabelDialog()
    }
    const handleUpdateLabel = () => {
        updateLabels()
        handleCloselabelDialog()
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
    const handleCloselabelDialog = () => {
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
    const addlabels = useCallback(async () => {
        const addedLabelData = {
            name: labelName,
            label: newLabel,
            version: labelVersion
        }
        const res = await client.post<LabelResponse>('/label/create', addedLabelData)
        await fetchLabels()
    }, [])
    const updateLabels = useCallback(async () => {
        const updatedLabelData = {
            id: labelId,
            name: labelName,
            label: newLabel,
            version: labelVersion
        }
        const res = await client.post<LabelResponse>('/label.update', updatedLabelData)
        await fetchLabels()
    }, [])
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

            <table className="table-auto min-w-full mt-4">
                <thead>
                    <tr>
                        <th className="border-b-2 py-1">ラベル</th>
                        <th className="border-b-2 py-1">ラベル名</th>
                    </tr>
                </thead>
                <tbody>
                    
                </tbody>
            </table>
        </div>
        </>
    )
}

export default Setting