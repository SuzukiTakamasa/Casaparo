"use client"

//export const runtime = 'edge'

import React, {useState, useEffect, useContext, useCallback} from "react"
//import { PencilIcon, TrashIcon } from "@heroicons/react"

import {YearProvider, YearContext} from "../components/YearPicker"
import YearPicker from "../components/YearPicker"

import {MonthProvider, MonthStrProvider, MonthContext} from "../components/MonthPaginator"
import MonthPaginator from "../components/MonthPaginator"

import {HouseholdData, HouseholdResponse, IsCompleted} from "../utils/constants"
import APIClient from "../utils/api_client"


const client = new APIClient()

const boolToInt = (flag: boolean) => +flag
const intToBool = (bit: number) => !!bit
const setUser = (isOwner: number) => {
    return isOwner ? "🥺" : "🥺ྀི"
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
    const [isCompleted, setIsCompleted] = useState(0)

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

    const fetchHouseholds = useCallback(async () => {
        try {
            const hh = await client.get<HouseholdResponse>(`/household/${householdYear}/${householdMonth}`)
            setHouseholds(hh || [])
        } catch (e) {
            console.error("Failed to fetch households", e)
        }
    }, [householdYear, householdMonth])
    const fetchIsCompleted = useCallback(async () => {
        try {
            const res = await client.get<IsCompleted>(`/completed_household/${householdYear}/${householdMonth}`)
            if (res !== null) {
                setIsCompleted(res.is_completed)
            } else {
                throw new Error()
            }
        } catch (e) {
            console.error("Failed to fetch is_completed", e)
        }
    }, [householdYear, householdMonth])
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
            const res = await client.post<HouseholdResponse>('/household/create', addedHouseholdData)
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
            const res = await client.post<HouseholdResponse>('/household/update', updatedHouseholdData)
            await fetchHouseholds()
        } catch (e) {
            console.error("Failed to update a household", e)
        }  
    }
    const deleteHousehold = async (deletedHouseholdData: HouseholdData) => {
        if (!window.confirm("削除しますか？")) return
        try {
            const res = await client.post<HouseholdResponse>('/household/delete', deletedHouseholdData)
            await fetchHouseholds()
        } catch (e) {
            console.error("Failed to delete a household", e)
        }
    }
    const calculateBillingAmount = useCallback(() => {
        let balance = 0
        households.forEach((household, _) => {
            household.is_owner ? balance += household.amount : balance -= household.amount
        })
        setBillingAmount(balance)
    }, [households])

    useEffect(() => {
        fetchHouseholds()
        fetchIsCompleted()
    }, [fetchHouseholds, fetchIsCompleted])

    useEffect(() => {
        calculateBillingAmount()
    }, [calculateBillingAmount])

    return (
    <MonthProvider month={householdMonth} setMonth={setHouseholdMonth}>
        <h1 className="text-2xl font-bold mc-4">家計簿</h1>

        <YearProvider year={householdYear} setYear={setHouseholdYear}>
            <YearPicker />
        </YearProvider>

        <div className="container mx-auto p-4">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={handleOpenAddDialog}
                disabled={intToBool(isCompleted)}
                >
                登録
            </button>
            <div className="flex">
                <MonthStrProvider monthStr="月の家計簿" cssStr="text-2xl font-bold mc-4" />
                {intToBool(isCompleted) && <div className="text-2xl font-bold mc-4 bg-red-900">(請求済み)</div>}
            </div>

            {showDialog && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded">
                        <div className="flex flex-col space-y-4 mb-4">
                            <input
                                className="border p-2 text-black"
                                type="text"
                                placeholder="項目"
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
                        <th className="border-b-2 px-2 py-1 bg-blue-900 text-white">項目</th>
                        <th className="border-b-2 px-2 py-1 bg-blue-900 text-white">金額</th>
                        <th className="border-b-2 px-2 py-1 bg-blue-900 text-white">登録者</th>
                        <th className="border-b-2 px-2 py-1 bg-blue-900 text-white"></th>
                    </tr>
                </thead>
                <tbody>
                    {households.map((household, i) => (
                        <tr key={i} className={`${household.is_default && "bg-gray-500"}`}>
                            <td className="border-b px-2 py-1 text-center">{household.name}</td>
                            <td className="border-b px-2 py-1 text-right">¥ {household.is_owner ? household.amount : `-${household.amount}`}</td>
                            <td className="border-b px-2 py-1 text-center w-24">{setUser(household.is_owner)}</td>
                            <td className="border-b px-2 py-1 flex-row justify-end items-center space-x-1 w-36">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-blod py-1 px-1 rounded"
                                    onClick={() => handleOpenUpdateDialog({
                                        id: household.id,
                                        name: household.name,
                                        amount: household.amount,
                                        is_default: household.is_default,
                                        is_owner: household.is_owner,
                                        version: household.version
                                    })}
                                    disabled={intToBool(isCompleted)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                                    </svg>
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                    onClick={() => deleteHousehold({
                                        id: household.id,
                                        name: household.name,
                                        amount: household.amount,
                                        is_default: household.is_default,
                                        is_owner: household.is_owner,
                                        version: household.version
                                    })}
                                    disabled={intToBool(isCompleted)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <td className="border-b px-2 py-1 md:text-lg text-center font-bold">請求金額</td>
                    <td className="border-b px-2 py-1 md:text-lg text-right font-bold">¥ {billingAmount}</td>
                </tfoot>
            </table>
        </div>

        <MonthPaginator />
    </MonthProvider>
    )
}

export default Household