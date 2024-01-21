"use client"

import React, {useState, useEffect} from "react"

import {YearProvider} from "../components/YearPicker"
import YearPicker from "../components/YearPicker"

import {MonthProvider} from "../components/MonthPaginator"
import MonthPaginator from "../components/MonthPaginator"

import {HouseholdData} from "../utils/constants"

const Household = () => {
    const [showDialog, setShowDialog] = useState(false)

    const [households, setHouseholds] = useState<HouseholdData[]>([])
    const [newItemName, setNewItemName] = useState("")
    const [newAmount, setNewAmount] = useState("")
    const [isDefault, setIsDefault] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [billingAmount, setBillingAmount] = useState(0)

    const handleAddHousehold = () => {
        setShowDialog(false)
        setNewItemName("")
        setNewAmount("")
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setNewItemName("")
        setNewAmount("")
    }
    const handleSetIsDefault = () => {
        setIsDefault(!isDefault)
    }
    const handleSetIsOwner = () => {
        setIsOwner(!isOwner)
    }
    const calculateBillingAmount = () => {
        let balance = 0
        households.forEach((household, _) => {
            household.is_owner ? balance += household.amount : balance -= household.amount
        })
        setBillingAmount(balance)
    }

    useEffect(() => {
        calculateBillingAmount()
    }, [])

    return (
    <MonthProvider>
        <h1 className="text-2xl font-bold mc-4">Household</h1>

        <YearProvider>
            <YearPicker />
        </YearProvider>

        <div className="container mx-auto p-4">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={() => setShowDialog(true)}
                >
                登録
            </button>

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
                            onClick={handleAddHousehold}>
                            登録
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
                        <th className="border px-4 py-2">項目名</th>
                        <th className="border px-4 py-2">金額</th>
                        <th className="border px-4 py-2">登録者</th>
                    </tr>
                </thead>
                <tbody>
                    {households.map((household, i) => (
                        <tr key={i}>
                            <td className="border px-4 py-2">{household.name}</td>
                            <td className="border px-4 py-2 text-right">{household.amount}</td>
                            <td className="border px-4 py-2">{household.user}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <td className="border px-4 py-2 text-center font-bold">請求金額</td>
                    <td className="border px-4 py-2 text-right">{billingAmount}</td>
                </tfoot>
            </table>
        </div>

        <MonthPaginator />
    </MonthProvider>
    )
}

export default Household