"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useCallback, useContext } from 'react'

import { YearProvider, YearContext } from '@components/YearPicker'
import YearPicker from '@components/YearPicker'

import { MonthProvider, MonthContext } from '@components/MonthPaginator'
import MonthPaginator from '@components/MonthPaginator'

import { ShiftData, ShiftResponse } from '@utils/interfaces'
import { EditButton, DeleteButton } from '@components/Buttons'
import { ToasterComponent, APIResponseToast } from '@components/ToastMessage'
import ValidationErrorMessage from '@components/ValidationErrorMessage'
import Loader from '@components/Loader'
import { PageTitle } from '@components/Title'
import { HorizontallyScrollableTable } from '@components/HorizontallyScrollableTable'
import { APIClient } from '@utils/api_client'
import { getToday, getNumberOfDays, getWeekDay, formatNumberWithCommas, isUnsignedInteger } from '@utils/utility_function'


const client = new APIClient()

const HoursArray = Array.from({ length: 24 }, (_, i) => i)

const DependentWall = 108333

const Shift = () => {
    const { year } = useContext(YearContext)
    const { month } = useContext(MonthContext)
    const [shiftYear, setShiftYear] = useState(year)
    const [shiftMonth, setShiftMonth] = useState(month)

    const today = getToday()

    const [shifts, setShifts] = useState<ShiftResponse>([])

    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    const [isBlocking, setIsBlocking] = useState(false)

    const [id, setId] = useState(0)
    const [date, setDate] = useState(today)
    const [work, setWork] = useState("")
    const [workingHourFrom, setWorkingHourFrom] = useState(0)
    const [workingHourTo, setWorkingHourTo] = useState(0)
    const [hourlyWage, setHourlyWage] = useState("")
    const [transportationExpense, setTransportationExpense] = useState("")
    const [version, setVersion] = useState(1)

    const [workValidMsg, setWorkValidMsg] = useState("")
    const [workingHourValidMsg, setWorkingHourValidMsg] = useState("")
    const [hourlyWageValidMsg, setHourlyWageValidMsg] = useState("")
    const [transportationExpenseValidMsg, setTransportationExpenseValidMsg] = useState("")

    const numberOfDays = getNumberOfDays(shiftYear, shiftMonth)
    const monthDaysArray = Array.from({ length: numberOfDays }, (_, i) => i + 1)

    const calcWage = (shift: ShiftData): number => {
        return (shift.working_hour_to - shift.working_hour_from) * shift.hourly_wage + (shift.transportation_expense ?? 0)
    }

    const totalWage = shifts.reduce((total, shift) => total + calcWage(shift), 0)

    const validate = () => {
        let isValid = true
        if (work === "") {
            isValid = false
            setWorkValidMsg("勤務先を入力してください。")
        }
        if (workingHourFrom >= workingHourTo) {
            isValid = false
            setWorkingHourValidMsg("終了時刻は開始時刻より後に設定してください。")
        }
        if (hourlyWage === "") {
            isValid = false
            setHourlyWageValidMsg("時給を入力してください。")
        } else if (!isUnsignedInteger(hourlyWage)) {
            isValid = false
            setHourlyWageValidMsg("整数値を入力してください。")
        }
        if (transportationExpense !== "" && !isUnsignedInteger(transportationExpense)) {
            isValid = false
            setTransportationExpenseValidMsg("整数値を入力してください。")
        }
        return isValid
    }
    const fetchShifts = useCallback(async () => {
        const shifts = await client.get<ShiftResponse>(`/v2/shift/${shiftYear}/${shiftMonth}`)
        setShifts(shifts.data || [])
    }, [shiftYear, shiftMonth])
    const handleOpenAddDialog = () => {
        setShowDialog(true)
    }
    const handleOpenUpdateDialog = ({ id, date, work, working_hour_from, working_hour_to, hourly_wage, transportation_expense, version }: ShiftData) => {
        setShowDialog(true)
        setIsUpdate(true)
        setId(id as number)
        setDate(date)
        setWork(work)
        setWorkingHourFrom(working_hour_from)
        setWorkingHourTo(working_hour_to)
        setHourlyWage(String(hourly_wage))
        setTransportationExpense(transportation_expense === null ? "" : String(transportation_expense))
        setVersion(version)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setIsUpdate(false)
        setId(0)
        setDate(today)
        setWork("")
        setWorkingHourFrom(0)
        setWorkingHourTo(0)
        setHourlyWage("")
        setTransportationExpense("")
        setVersion(1)
        setWorkValidMsg("")
        setWorkingHourValidMsg("")
        setHourlyWageValidMsg("")
        setTransportationExpenseValidMsg("")
    }
    const handleAddShift = async () => {
        if (!validate()) return
        setIsBlocking(true)
        const response = await addShift()
        setIsBlocking(false)
        handleCloseDialog()
        APIResponseToast(response, "シフトを登録しました。", "シフトの登録に失敗しました。")
    }
    const handleUpdateShift = async () => {
        if (!validate()) return
        setIsBlocking(true)
        const response = await updateShift()
        setIsBlocking(false)
        handleCloseDialog()
        APIResponseToast(response, "シフトを更新しました。", "シフトの更新に失敗しました。")
    }
    const addShift = async () => {
        const addShiftData = {
            year: shiftYear,
            month: shiftMonth,
            date: date,
            work: work,
            working_hour_from: workingHourFrom,
            working_hour_to: workingHourTo,
            hourly_wage: Number(hourlyWage),
            transportation_expense: transportationExpense === "" ? 0 : Number(transportationExpense),
            version: version
        }
        const response = await client.post<ShiftData>('/v2/shift/create', addShiftData)
        await fetchShifts()
        return response
    }
    const updateShift = async () => {
        const updateShiftData = {
            id: id,
            year: shiftYear,
            month: shiftMonth,
            date: date,
            work: work,
            working_hour_from: workingHourFrom,
            working_hour_to: workingHourTo,
            hourly_wage: Number(hourlyWage),
            transportation_expense: transportationExpense === "" ? 0 : Number(transportationExpense),
            version: version
        }
        const response = await client.post<ShiftData>('/v2/shift/update', updateShiftData)
        await fetchShifts()
        return response
    }
    const deleteShift = async (deletedShiftData: ShiftData) => {
        if (!window.confirm("削除しますか？")) return
        const response = await client.post<ShiftData>('/v2/shift/delete', deletedShiftData)
        APIResponseToast(response, "シフトを削除しました。", "シフトの削除に失敗しました。")
        await fetchShifts()
    }

    useEffect(() => {
        fetchShifts()
    }, [fetchShifts])

    return (
        <>
            <MonthProvider month={shiftMonth} setMonth={setShiftMonth} setYear={setShiftYear}>
                <PageTitle title={"⚔️ シフト ⚔️"} />

                <YearProvider year={shiftYear} setYear={setShiftYear}>
                    <YearPicker />
                </YearProvider>

                <div className="container mx-auto p-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                        onClick={handleOpenAddDialog}
                    >
                        登録
                    </button>
                    <MonthPaginator className="text-lg font-bold" />

                    {showDialog && (
                        <div className="fixed inset-0 bg-gray-500/50 flex items-start justify-center z-50 overflow-y-auto">
                            <div className="bg-white p-4 rounded">
                                <div className="flex flex-col space-y-4 mb-4">
                                    <label className="text-black">
                                        <span>勤務先</span>
                                        <input
                                            className="block w-full border p-2 mt-2 text-black"
                                            type="text"
                                            placeholder="勤務先"
                                            value={work}
                                            onChange={e => setWork(e.target.value)}
                                        />
                                    </label>
                                    <ValidationErrorMessage message={workValidMsg} />
                                    <label className="text-black">
                                        <span>日付</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={date}
                                            onChange={e => setDate(Number(e.target.value))}
                                        >
                                            {monthDaysArray.map((d, i) => (
                                                <option key={i} value={d}>{`${d}日(${getWeekDay(shiftYear, shiftMonth, d)})`}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <div className="flex justify-center">
                                        <label className="text-black mx-1">
                                            <span>開始時刻</span>
                                            <select
                                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                                value={workingHourFrom}
                                                onChange={e => setWorkingHourFrom(Number(e.target.value))}
                                            >
                                                {HoursArray.map((h, i) => (
                                                    <option key={i} value={h}>{`${h}:00`}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="text-black mx-1">
                                            <span>終了時刻</span>
                                            <select
                                                className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                                value={workingHourTo}
                                                onChange={e => setWorkingHourTo(Number(e.target.value))}
                                            >
                                                {HoursArray.map((h, i) => (
                                                    <option key={i} value={h}>{`${h}:00`}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                    <ValidationErrorMessage message={workingHourValidMsg} />
                                    <label className="text-black">
                                        <span>時給(円)</span>
                                        <input
                                            className="block w-full border p-2 mt-2 text-black"
                                            type="text"
                                            placeholder="時給"
                                            value={hourlyWage}
                                            onChange={e => setHourlyWage(e.target.value)}
                                        />
                                    </label>
                                    <ValidationErrorMessage message={hourlyWageValidMsg} />
                                    <label className="text-black">
                                        <span>交通費(円)</span>
                                        <input
                                            className="block w-full border p-2 mt-2 text-black"
                                            type="text"
                                            placeholder="交通費"
                                            value={transportationExpense}
                                            onChange={e => setTransportationExpense(e.target.value)}
                                        />
                                    </label>
                                    <ValidationErrorMessage message={transportationExpenseValidMsg} />
                                </div>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={isUpdate ? handleUpdateShift : handleAddShift}
                                        disabled={isBlocking}
                                    >
                                        {isBlocking ? <Loader size={20} isLoading={isBlocking} /> : isUpdate ? "変更" : "登録"}
                                    </button>
                                    {isUpdate &&
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            onClick={handleAddShift}
                                            disabled={isBlocking}
                                        >
                                            {isBlocking ? <Loader size={20} isLoading={isBlocking} /> : "複製"}
                                        </button>
                                    }
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

                    <div className="px-1 py-2 text-xl text-center text-white font-bold">今月の給料： ¥{formatNumberWithCommas(totalWage)}</div>
                    <div className={`px-1 py-2 text-xl text-center font-bold ${totalWage > DependentWall ? "text-red-500" : "text-white"}`}>
                        {totalWage > DependentWall
                            ? `扶養の壁まであと： ¥${formatNumberWithCommas(totalWage - DependentWall)}(超過)`
                            : `扶養の壁まであと： ¥${formatNumberWithCommas(DependentWall - totalWage)}`}
                    </div>

                    <HorizontallyScrollableTable>
                        <thead>
                            <tr>
                                <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap"></th>
                                <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap">日付</th>
                                <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap">勤務先</th>
                                <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap">時間</th>
                                <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap">給与</th>
                                <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap">交通費</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.map((shift, i) => (
                                <tr key={i} className={`${shiftYear === year && shiftMonth === month && today === shift.date ? "bg-gray-500" : ""}`}>
                                    <td className="border-b py-1 flex-row justify-center items-center space-x-1 whitespace-nowrap">
                                        <EditButton
                                            onClick={() => handleOpenUpdateDialog({
                                                id: shift.id,
                                                year: shift.year,
                                                month: shift.month,
                                                date: shift.date,
                                                work: shift.work,
                                                working_hour_from: shift.working_hour_from,
                                                working_hour_to: shift.working_hour_to,
                                                hourly_wage: shift.hourly_wage,
                                                transportation_expense: shift.transportation_expense,
                                                version: shift.version
                                            })}
                                        />
                                        <DeleteButton
                                            onClick={() => deleteShift({
                                                id: shift.id,
                                                year: shift.year,
                                                month: shift.month,
                                                date: shift.date,
                                                work: shift.work,
                                                working_hour_from: shift.working_hour_from,
                                                working_hour_to: shift.working_hour_to,
                                                hourly_wage: shift.hourly_wage,
                                                transportation_expense: shift.transportation_expense,
                                                version: shift.version
                                            })}
                                        />
                                    </td>
                                    <td className="border-b px-1 py-1 text-center text-sm whitespace-nowrap">{`${shift.date}日(${getWeekDay(shift.year, shift.month, shift.date)})`}</td>
                                    <td className="border-b px-1 py-1 text-center text-sm">{shift.work}</td>
                                    <td className="border-b px-1 py-1 text-center text-sm whitespace-nowrap">{`${shift.working_hour_from}:00-${shift.working_hour_to}:00`}</td>
                                    <td className="border-b px-1 py-1 text-center text-sm whitespace-nowrap">{`¥${formatNumberWithCommas(calcWage(shift))}`}</td>
                                    <td className="border-b px-1 py-1 text-center text-sm whitespace-nowrap">{`¥${formatNumberWithCommas(shift.transportation_expense ?? 0)}`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </HorizontallyScrollableTable>
                </div>
            </MonthProvider>
            <ToasterComponent />
        </>
    )
}

export default Shift
