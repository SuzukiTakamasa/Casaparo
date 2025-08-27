"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useContext, useCallback } from 'react'

import { YearProvider, YearContext } from '@components/YearPicker'
import YearPicker from '@components/YearPicker'
import { TextLink } from '@components/TextLink'
import { MonthProvider, MonthContext } from '@components/MonthPaginator'
import MonthPaginator from '@components/MonthPaginator'
import { CheckBadgeIcon } from '@components/Heroicons'
import { EditButton, DeleteButton } from '@components/Buttons'
import { ToasterComponent, APIResponseToast } from '@components/ToastMessage'
import ValidationErrorMessage from '@components/ValidationErrorMessage'
import Loader from '@components/Loader'

import { HouseholdData, HouseholdResponse, IsCompleted, CompletedHouseholdData, HouseholdMonthlySummaryResponse, Detail } from '@utils/interfaces'
import { formatNumberWithCommas } from '@utils/utility_function'
import { APIClient } from '@utils/api_client'
import { adaptTwoPointReader, setCreatedByStr, getToday, boolToInt, intToBool, isUnsignedInteger } from '@utils/utility_function'
import { HouseholdConstants, DateOfFixedHousehold } from '@utils/constants'

const client = new APIClient()


const Household = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    const [showDetail, setShowDetail] = useState(false)
    const [newItemNameValidMsg, setNewItemNameValidMsg] = useState("")
    const [newAmountValidMsg, setNewAmountValidMsg] = useState("")

    const { month } = useContext(MonthContext)
    const [householdMonth, setHouseholdMonth] = useState(month)

    const { year } = useContext(YearContext)
    const [householdYear, setHouseholdYear] = useState(year)

    const [households, setHouseholds] = useState<HouseholdResponse>([])
    const [id, setId] = useState(0)
    const [newItemName, setNewItemName] = useState("")
    const [newAmount, setNewAmount] = useState("")
    const [isDefault, setIsDefault] = useState(false)
    const [isOwner, setIsOwner] = useState(1)
    const [version, setVersion] = useState(1)

    const [billingAmount, setBillingAmount] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)

    const [isCompleted, setIsCompleted] = useState(0)
    const [expense, setExpense] = useState<HouseholdMonthlySummaryResponse>([])
    const [isLoading, setIsLoading] = useState(true)
    
    const [isBlocking, setIsBlocking] = useState(false)

    const today = getToday()

    const validate = () => {
        let isValid = true
        if (newItemName === "") {
            isValid = false
            setNewItemNameValidMsg("項目名を入力してください。")
        }
        if (newAmount === "") {
            isValid = false
            setNewAmountValidMsg("金額を入力してください。")
        }
        if (!isUnsignedInteger(newAmount)) {
            isValid = false
            setNewAmountValidMsg("整数値を入力してください。")
        }
        return isValid
    }

    const handleAddHousehold = async () => {
        if (!validate()) return
        setIsBlocking(true)
        const response = await addHousehold()
        setIsBlocking(false)
        handleCloseDialog()
        APIResponseToast(response, "家計簿を登録しました。", "登録に失敗しました。")
    }
    const handleUpdateHousehold = async () => {
        if (!validate()) return
        setIsBlocking(true)
        const response = await updateHousehold()
        setIsBlocking(false)
        handleCloseDialog()
        APIResponseToast(response, "家計簿を変更しました。", "変更に失敗しました。")
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
        setIsOwner(is_owner)
        setVersion(version)
        setIsUpdate(true)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setId(0)
        setNewItemName("")
        setNewAmount("")
        setIsDefault(false)
        setIsOwner(1)
        setVersion(1)
        setIsUpdate(false)
        setNewItemNameValidMsg("")
        setNewAmountValidMsg("")
    }
    const handleSetIsDefault = () => {
        setIsDefault(!isDefault)
    }
    const handleSetShowDetail = () => {
        setShowDetail(!showDetail)
    }

    const fetchHouseholds = useCallback(async () => {
        const households = await client.get<HouseholdResponse>(`/v2/household/${householdYear}/${householdMonth}`)
        setHouseholds(households.data || [])
    }, [householdYear, householdMonth])
    const fetchIsCompleted = useCallback(async () => {
        setIsLoading(true)
            const res = await client.get<IsCompleted>(`/v2/completed_household/${householdYear}/${householdMonth}`)
            if (res.data) {
                setIsCompleted(res.data.is_completed)
                if (res.data.is_completed === HouseholdConstants.IsCompleted.COMPLETED) {
                    const expenses = await client.get<HouseholdMonthlySummaryResponse>(`/v2/completed_household/monthly_summary/${householdYear}/${householdMonth}`)
                    if (expenses.data) {
                        setExpense(expenses.data)
                    }
                }
            }
        setIsLoading(false)
    }, [householdYear, householdMonth])
    const addHousehold = async () => {
        const addedHouseholdData = {
            name: newItemName,
            amount: Number(newAmount),
            year: householdYear,
            month: householdMonth,
            is_default: boolToInt(isDefault),
            is_owner: isOwner,
            version: version
        }
        const response = await client.post<HouseholdData>('/v2/household/create', addedHouseholdData)
        await fetchHouseholds()
        return response
    }
    const updateHousehold = async () => {
        const updatedHouseholdData = {
            id: id,
            name: newItemName,
            amount: Number(newAmount),
            year: householdYear,
            month: householdMonth,
            is_default: boolToInt(isDefault),
            is_owner: isOwner,
            version: version
        }
        const response = await client.post<HouseholdData>('/v2/household/update', updatedHouseholdData)
        await fetchHouseholds()
        return response
    }
    const deleteHousehold = async (deletedHouseholdData: HouseholdData) => {
        if (!window.confirm("削除しますか？")) return
        const response = await client.post<HouseholdData>('/v2/household/delete', deletedHouseholdData)
        APIResponseToast(response, "家計簿を削除しました。", "削除に失敗しました。")
        await fetchHouseholds()
    }
    const calculateBillingAmount = useCallback(() => {
        let balance = 0
        households.forEach((household, _) => {
            household.is_owner ? balance += household.amount : balance -= household.amount
        })
        setBillingAmount(balance)
    }, [households])
    const calculateTotalAmount = useCallback(() => {
        let balance = 0
        households.forEach(household => balance += household.amount)
        setTotalAmount(balance)
    }, [households])
    const handleAddCompletedHousehold = async () => {
        if (!window.confirm("家計簿を確定しますか？")) return
        let detailArray = []
        for await (let household of households) {
            detailArray.push({ name: household.name, amount: household.amount} as Detail)
        }
        const completedHousehold = {
            year: householdYear,
            month: householdMonth,
            detail: JSON.stringify(detailArray),
            billing_amount: billingAmount,
            total_amount: totalAmount
        }
        const response = await client.post<CompletedHouseholdData>('/v2/completed_household/create', completedHousehold)
        APIResponseToast(response, "家計簿を確定しました。", "確定に失敗しました。")
        await fetchIsCompleted()
    }

    useEffect(() => {
        fetchHouseholds()
        fetchIsCompleted()
    }, [fetchHouseholds, fetchIsCompleted])

    useEffect(() => {
        calculateBillingAmount()
        calculateTotalAmount()
    }, [calculateBillingAmount, calculateTotalAmount])


    return (
        <>
        <ToasterComponent />
        <MonthProvider month={householdMonth} setMonth={setHouseholdMonth} setYear={setHouseholdYear}>
            <h1 className="text-2xl font-bold mc-4">⚪️ 家計簿 ⚪️</h1>

            <YearProvider year={householdYear} setYear={setHouseholdYear}>
                <YearPicker />
            </YearProvider>

            <div className="container mx-auto p-4">
                <MonthPaginator className="text-lg font-bold mx-4" />
                {isLoading ?
                    <></>
                    :
                    <div>
                        {intToBool(isCompleted) &&
                            <div className="text-2xl font-bold bg-green-900 flex justify-center">
                                <div className="mt-1">
                                    <CheckBadgeIcon/>
                                </div>
                                清算済み
                            </div>
                        }
                        {!isCompleted &&
                            (householdYear < year ||
                            (householdYear === year && householdMonth < month) ||
                            (householdYear === year && householdMonth === month && today >= DateOfFixedHousehold)) &&
                            <div>
                                <div className="flex justify-center">
                                    <button
                                        className="text-2xl bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-8 rounded mb-4"
                                        onClick={handleAddCompletedHousehold}
                                    >
                                        確定
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                }
                {!isCompleted &&
                    <div>
                        <div className="px-1 py-2 text-xl text-center text-white font-bold">清算金額： ¥{isLoading ? "-" : formatNumberWithCommas(billingAmount)}</div>
                        <div className="px-1 py-2 text-xl text-center text-white font-bold">合計金額： ¥{isLoading ? "-" : formatNumberWithCommas(totalAmount)}</div>
                    </div>
                }

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
                                <ValidationErrorMessage message={newItemNameValidMsg} />
                                <input
                                    className="border p-2 text-black"
                                    type="text"
                                    placeholder="金額"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                />
                                <ValidationErrorMessage message={newAmountValidMsg} />
                                <label className="flex items-center space-x-2 text-black">
                                    <input
                                        type="checkbox"
                                        checked={isDefault}
                                        onChange={handleSetIsDefault}            
                                    />
                                    <span>デフォルト値に設定</span>
                                </label>
                                <div className="text-black">登録者</div>
                                <div className="text-3xl text-center">
                                    <input
                                        type="radio"
                                        value="1"
                                        checked={isOwner === 1}
                                        onChange={e => setIsOwner(Number(e.target.value))}
                                        />
                                        <span className="mr-8">🥺</span>
                                    <input
                                        type="radio"
                                        value="0"
                                        checked={isOwner === 0}
                                        onChange={e => setIsOwner(Number(e.target.value))}
                                        />
                                        <span>🥺ྀི</span>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={isUpdate ? handleUpdateHousehold : handleAddHousehold}
                                    disabled={newItemName == "" || newAmount == "" || isBlocking}
                                >
                                    {isBlocking ? <Loader size={20} isLoading={isBlocking} /> : isUpdate ? "変更" : "登録"}
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

                {isCompleted ?
                <div>
                    <div>
                        <div className="px-1 py-2 text-xl text-center text-white font-bold">清算金額： ¥{isLoading ? "-" : expense[0]?.billing_amount ? formatNumberWithCommas(expense[0]?.billing_amount) : "-"}</div>
                        <div className="px-1 py-2 text-xl text-center text-white font-bold">合計金額： ¥{isLoading ? "-" : expense[0]?.total_amount ? formatNumberWithCommas(expense[0]?.total_amount): "-"}</div>
                        <div className="flex justify-center">
                            <button
                                className="text-white"
                                onClick={handleSetShowDetail}
                            >
                                {showDetail ? "▼ 明細を非表示" : "▶︎ 明細を表示"}
                            </button>
                        </div>
                    </div>
                    {showDetail && 
                        <table className="table_auto min-w-full mt-4">
                            <thead>
                                <tr>
                                    <th className="border-b-2 py-1 bg-gray-700 text-white">項目</th>
                                    <th className="border-b-2 py-1 bg-gray-700 text-white">金額</th>
                                </tr>
                            </thead>
                            <tbody>
                            {expense.map((e, i) => (
                                <tr key={i}>
                                    <td className="border-b px-1 py-1 text-center">{e.detail_name}</td>
                                    <td className="border-b px-1 py-1 text-right">¥{e?.detail_amount && formatNumberWithCommas(Number(e.detail_amount))}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    }
                    <div className="flex justify-center mt-4">
                        <TextLink path="statistics" text="各月の家計簿の推移" />
                    </div>
                </div>
                :
                <>
                <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"}
                        onClick={handleOpenAddDialog}
                    >
                        登録
                    </button>
                <table className="table-auto min-w-full mt-4">
                    <thead>
                        <tr>
                            <th className="border-b-2 py-1 bg-blue-900"></th>
                            <th className="border-b-2 px-1 py-1 bg-blue-900 text-white text-sm">項目</th>
                            <th className="border-b-2 px-1 py-1 bg-blue-900 text-white text-sm">金額</th>
                            <th className="border-b-2 px-1 py-1 bg-blue-900 text-white text-sm">登録者</th>
                        </tr>
                    </thead>
                    <tbody>
                        {households.map((household, i) => (
                            <tr key={i} className={`${household.is_default === HouseholdConstants.IsDefault.DEFAULT && "bg-gray-500"}`}>
                                <td className="border-b py-1 flex-row justify-center items-center space-x-1">
                                    <EditButton
                                        onClick={() => handleOpenUpdateDialog({
                                            id: household.id,
                                            name: household.name,
                                            amount: household.amount,
                                            is_default: household.is_default,
                                            is_owner: household.is_owner,
                                            version: household.version
                                    })}/>
                                    <DeleteButton
                                        onClick={() => deleteHousehold({
                                            id: household.id,
                                            name: household.name,
                                            amount: household.amount,
                                            is_default: household.is_default,
                                            is_owner: household.is_owner,
                                            version: household.version
                                        })}
                                    />
                                </td>
                                <td className="border-b px-1 py-1 text-center text-sm">{adaptTwoPointReader(household.name, 10)}</td>
                                <td className="border-b px-1 py-1 text-right text-sm">¥{household.is_owner === HouseholdConstants.IsOwner.OWNER ? formatNumberWithCommas(household.amount) : `-${formatNumberWithCommas(household.amount)}`}</td>
                                <td className="border-b px-1 py-1 text-center text-sm">{setCreatedByStr(household.is_owner)}</td>  
                            </tr>
                        ))}
                    </tbody>
                </table>
                </>
                }
            </div>
        </MonthProvider>
        </>
    )
}

export default Household