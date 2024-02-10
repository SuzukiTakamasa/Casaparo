"use client"

//export const runtime = 'edge'

import React, {useState, useEffect, useContext} from "react"

import {YearProvider, YearContext} from "../components/YearPicker"
import YearPicker from "../components/YearPicker"

import {MonthProvider, MonthStrProvider, MonthContext} from "../components/MonthPaginator"
import MonthPaginator from "../components/MonthPaginator"

import {HouseholdData, HouseholdResponse} from "../utils/constants"
import APIClient from "../utils/api_client"


const api_client = new APIClient()

const boolToInt = (flag: boolean) => {
    return flag ? 1 : 0
}
const intToBool = (bit: number) => {
    return bit ? true : false
}


const Household = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)

    const [households, setHouseholds] = useState<HouseholdResponse>([])
    const [id, setId] = useState(0)
    const [newItemName, setNewItemName] = useState("")
    const [newAmount, setNewAmount] = useState(0)
    const [isDefault, setIsDefault] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [version, setVersion] = useState(1)
    const [billingAmount, setBillingAmount] = useState(0)

    const { month } = useContext(MonthContext)
    const [householdMonth, setHouseholdMonth] = useState(month)

    const { year } = useContext(YearContext)
    const [householdYear, setHouseholdYear] = useState(year)

    const handleAddHousehold = () => {
        addHousehold()
        handleCloseDialog()
    }
    const handleUpdateHousehold = () => {
        updateHousehold()
        handleCloseDialog()
    }
    const handleOpenAddDialog = () => {
        setShowDialog(true)
    }
    const handleOpenUpdateDialog = ({id, name, amount, is_default, is_owner, version}: HouseholdData) => {
        setShowDialog(true)
        setId(id as number)
        setNewItemName(name)
        setNewAmount(amount)
        setIsDefault(intToBool(is_default))
        setIsOwner(intToBool(is_owner))
        setVersion(version)
        setIsUpdate(true)
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setNewItemName("")
        setNewAmount(0)
        setIsDefault(false)
        setIsOwner(false)
        setVersion(1)
        setIsUpdate(false)
    }
    const handleSetIsDefault = () => {
        setIsDefault(!isDefault)
    }
    const handleSetIsOwner = () => {
        setIsOwner(!isOwner)
    }

    const fetchHouseholds = async () => {
        try {
            const hh = await api_client.get<HouseholdResponse>(`/household/${householdYear}/${householdMonth}`)
            setHouseholds(hh || [])
        } catch (e) {
            console.error("Failed to fetch households", e)
        }
    }
    const addHousehold = async () => {
        const addedHouseholdData = {
            name: newItemName,
            amount: newAmount,
            year: householdYear,
            month: householdMonth,
            is_default: boolToInt(isDefault),
            is_owner: boolToInt(isOwner),
            version: 1
        }
        try {
            const res = await api_client.post<HouseholdResponse>('/household/create', addedHouseholdData)
            await fetchHouseholds()
        } catch (e) {
            console.error("Failed to add a households", e)
        }
    }
    const updateHousehold = async () => {
        const updatedHouseholdData = {
            id: id,
            name: newItemName,
            amount: newAmount,
            year: householdYear,
            month: householdMonth,
            is_default: boolToInt(isDefault),
            is_owner: boolToInt(isOwner),
            version: version
        }
        try {
            const res = await api_client.post<HouseholdResponse>('/household/update', updatedHouseholdData)
            await fetchHouseholds()
        } catch (e) {
            console.error("Failed to update a household", e)
        }  
    }
    const deleteHousehold = async (deletedHouseholdData: HouseholdData) => {
        if (!window.confirm("削除しますか？")) return
        try {
            const res = await api_client.post<HouseholdResponse>('/household/delete', deletedHouseholdData)
            await fetchHouseholds()
        } catch (e) {
            console.error("Failed to delete a household", e)
        }
    }
    const calculateBillingAmount = () => {
        let balance = 0
        households.forEach((household, _) => {
            household.is_owner ? balance += household.amount : balance -= household.amount
        })
        setBillingAmount(balance)
    }

    useEffect(() => {
        fetchHouseholds()
    }, [householdYear, householdMonth])

    useEffect(() => {
        calculateBillingAmount()
    }, [households])

    return (
    <MonthProvider month={householdMonth} setMonth={setHouseholdMonth}>
        <h1 className="text-2xl font-bold mc-4">Household</h1>

        <YearProvider year={householdYear} setYear={setHouseholdYear}>
            <YearPicker />
        </YearProvider>

        <div className="container mx-auto p-4">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={handleOpenAddDialog}
                >
                登録
            </button>

            <MonthStrProvider monthStr="月の家計簿" cssStr="text-2xl font-bold mc-4" />

            {showDialog && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded">
                        <div className="flex flex-col space-y-4 mb-4">
                            <input
                                className="border p-2 text-black"
                                type="text"
                                placeholder="項目名"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                            />
                            <input
                                className="border p-2 text-black"
                                type="text"
                                placeholder="金額"
                                value={newAmount}
                                onChange={(e) => setNewAmount(Number(e.target.value))}
                            />
                            <label className="flex items-center space-x-2 text-black">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={handleSetIsDefault}            
                                />
                                <span>デフォルト値に設定</span>
                            </label>
                            <label className="flex items-center space-x-2 text-black">
                                <input
                                    type="checkbox"
                                    checked={isOwner}
                                    onChange={handleSetIsOwner}            
                                />
                                <span>オーナーとして登録</span>
                            </label>
                        </div>
                        <div className="flex justify-end space-x-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={isUpdate ? handleUpdateHousehold : handleAddHousehold}>
                            {isUpdate ? "変更" : "登録"}
                        </button>
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleCloseDialog}>
                            キャンセル
                        </button>
                        </div>
                    </div>
                </div>
            )}

            <table className="table-auto w-full">
                <thead>
                    <tr>
                        <th className="border px-4 py-2 bg-blue-900 text-white">項目名</th>
                        <th className="border px-4 py-2 bg-blue-900 text-white">金額</th>
                        <th className="border px-4 py-2 bg-blue-900 text-white"></th>
                    </tr>
                </thead>
                <tbody>
                    {households.map((household, i) => (
                        <tr key={i}>
                            <td className="border px-4 py-2 text-center">{household.name}</td>
                            <td className="border px-4 py-2 text-right">¥ {household.amount}</td>
                            <td className="border px-4 py-2 flext justify-center items-center space-x-2 w-36">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-blod py-1 px-2 rounded"
                                    onClick={() => handleOpenUpdateDialog({
                                        id: household.id,
                                        name: household.name,
                                        amount: household.amount,
                                        is_default: household.is_default,
                                        is_owner: household.is_owner,
                                        version: household.version
                                    })}
                                >
                                    編集
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                    onClick={() => deleteHousehold({
                                        id: household.id,
                                        name: household.name,
                                        amount: household.amount,
                                        is_default: household.is_default,
                                        is_owner: household.is_owner,
                                        version: household.version
                                    })}
                                >
                                    削除
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <td className="border px-4 py-2 text-center font-bold">請求金額</td>
                    <td className="border px-4 py-2 text-right">¥ {billingAmount}</td>
                </tfoot>
            </table>
        </div>

        <MonthPaginator />
    </MonthProvider>
    )
}

export default Household