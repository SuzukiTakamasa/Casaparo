"use client"

//export const runtime = 'edge'

import React, {useState, useEffect, useContext, useCallback} from "react"

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
    const [newAmount, setNewAmount] = useState("")
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
        setNewAmount(String(amount))
        setIsDefault(intToBool(is_default))
        setIsOwner(intToBool(is_owner))
        setVersion(version)
        setIsUpdate(true)
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setNewItemName("")
        setNewAmount("")
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
            amount: Number(newAmount),
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
            amount: Number(newAmount),
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
        <h1 className="text-2xl font-bold mc-4">⚪️ 家計簿 ⚪️</h1>

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
            <MonthPaginator monthStr="月" cssStr="text-lg font-bold mx-4" />
            {intToBool(isCompleted) && <div className="text-2xl font-bold mc-4 bg-red-900">(請求済み)</div>}

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
                                onChange={(e) => setNewAmount(e.target.value)}
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
                            onClick={isUpdate ? handleUpdateHousehold : handleAddHousehold}
                            disabled={newItemName == "" || newAmount == ""}
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
                        <th className="border-b-2 py-1 bg-blue-900"></th>
                        <th className="border-b-2 px-1 py-1 bg-blue-900 text-white">項目</th>
                        <th className="border-b-2 px-1 py-1 bg-blue-900 text-white">金額</th>
                        <th className="border-b-2 px-1 py-1 bg-blue-900 text-white">登録者</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {households.map((household, i) => (
                        <tr key={i} className={`${household.is_default && "bg-gray-500"}`}>
                            <td className="border-b py-1 flex-row justify-center items-center space-x-1">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                                    </svg>

                                </button>
                            </td>
                            <td className="border-b px-1 py-1 text-center">{household.name}</td>
                            <td className="border-b px-1 py-1 text-right">¥{household.is_owner ? household.amount : `-${household.amount}`}</td>
                            <td className="border-b px-1 py-1 text-center w-24">{setUser(household.is_owner)}</td>  
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <td className="border-b"></td>
                    <td className="border-b px-2 py-1 md:text-lg text-center font-bold">請求金額</td>
                    <td className="border-b px-2 py-1 md:text-lg text-right font-bold">¥{billingAmount}</td>
                </tfoot>
            </table>
        </div>
    </MonthProvider>
    )
}

export default Household