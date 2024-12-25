"use client"

//export const runtime = 'edge'

import { useEffect, useState, useCallback, useContext } from 'react'

import { MonthContext } from '@components/MonthPaginator'
import { YearContext } from '@components/YearPicker'
import Loader from '@components/Loader'
import TextLink from '@components/TextLink'

import APIClient from '@utils/api_client'

import { IsCompleted, FixedAmount, ScheduleResponse, AnniversaryResponse, InventoryResponse, TaskResponse } from '@/app/utils/interfaces'
import { formatNumberWithCommas, getToday, getWeekDay, setUser, sortSchedulesByDateTime, isWithinAWeekFromDueDate, isOverDueDate } from '@utils/utility_function'
import { ExclamationTriangleIcon } from '@components/HeroicIcons'


const client = new  APIClient()


export default function Home() {

  const { month } = useContext(MonthContext)
  const { year } = useContext(YearContext)

  const [totalAmount, setTotalAmount] = useState(0)
  const [billingAmount, setBillingAmount] = useState(0)
  const [schedules, setSchedules] = useState<ScheduleResponse>([])
  const [anniversaries, setAnniversaries] = useState<AnniversaryResponse>([])
  const [inventories, setInventories] = useState<InventoryResponse>([])
  const [tasks, setTasks] = useState<TaskResponse>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isCompletedCurrentMonth, setIsCompletedCurrentMonth] = useState(1)
  const [isCompletedLastMonth, setIsCompletedLastMonth] = useState(1)

  const today = getToday()

  const fetchFixedAmount = useCallback(async () => {
      const fixedAmount = await client.get<FixedAmount>(`/v2/household/fixed_amount/${year}/${month}`)
      if (fixedAmount.data) {
        setTotalAmount(fixedAmount.data.total_amount)
        setBillingAmount(fixedAmount.data.billing_amount)
        setIsLoading(false)
      }
  }, [year, month])
  const fetchSchedules = useCallback(async () => {
    const schedules = await client.get<ScheduleResponse>(`/v2/schedule/today_or_tomorrow/${year}/${month}/${today}`)
    setSchedules(schedules.data || [])
  }, [year, month, today])
  const fetchAnniversaries = useCallback(async() => {
    const anniversaries = await client.get<AnniversaryResponse>('/v2/anniversary')
    setAnniversaries(anniversaries.data || [])
  }, [])
  const fetchInventories = useCallback(async () => {
    const inventories = await client.get<InventoryResponse>('/v2/inventory')
    setInventories(inventories.data?.filter(i => i.amount === 0) || [])
  }, [])
  const fetchTasks = useCallback(async () => {
    const tasks = await client.get<TaskResponse>('/v2/task')
    setTasks(tasks.data?.filter(t => t.status !== 2) || [])
  }, [])
  const fetchIsCompletedCurrentMonth = useCallback(async () => {
    const isCompletedCurrentMonth = await client.get<IsCompleted>(`/v2/completed_household/${year}/${month}`)
    if (isCompletedCurrentMonth.data) {
      setIsCompletedCurrentMonth(isCompletedCurrentMonth.data.is_completed)
    }
  }, [])
  const fetchIsCompletedLastMonth = useCallback(async () => {
    const isCompletedLastMonth = await client.get<IsCompleted>(`/v2/completed_household/${year}/${month - 1}`)
    if (isCompletedLastMonth.data) {
      setIsCompletedLastMonth(isCompletedLastMonth.data.is_completed)
    }
  }, [])

   useEffect(() => {
    fetchFixedAmount()
    fetchSchedules()
    fetchTasks()
    fetchAnniversaries()
    fetchInventories()

    fetchIsCompletedCurrentMonth()
    fetchIsCompletedLastMonth()
   }, [fetchFixedAmount, fetchSchedules, fetchAnniversaries, fetchInventories, fetchTasks, fetchIsCompletedCurrentMonth, fetchIsCompletedLastMonth])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="container max-w-full">
        <h1 className="text-2xl font-bold pb-8">🥺ダッシュボード🥺ྀི</h1>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1">
          <div className="bg-black text-white p-2">
            <h2 className="text-2xl font-bold mb-4 text-center">今月の生活費・各負担分</h2>
            {isCompletedLastMonth === 0 &&
            <div className="flex justify-center bg-red-700">
              <ExclamationTriangleIcon/>
            <p>{`${month - 1}月の家計簿がまだ確定されていません。`}</p>
            </div>
            }
            {(isCompletedCurrentMonth === 0 && today >= 25) &&
            <div className="flex justify-center bg-yellow-700">
              <ExclamationTriangleIcon/>
              <p>{`${month}月の家計簿を確定してください。`}</p>
            </div>
            }
            <p className="text-xl mb-2 text-right">生活費合計： ¥ {isLoading ? <Loader size={20} isLoading={isLoading} /> : `${formatNumberWithCommas(totalAmount)}`}</p>
            <p className="text-xl mb-2 text-right">(🥺ྀི負担分： ¥ {isLoading ? <Loader size={20} isLoading={isLoading} /> : `${formatNumberWithCommas(billingAmount)}`})</p>
            <div className="flex justify-end">
              <TextLink path="/household" text="家計簿一覧へ" />
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1 my-1">
          <div className="bg-black text-white p-2">
              <h2 className="text-2xl font-bold mb-4 text-center">今日・明日の予定</h2>
              {sortSchedulesByDateTime(schedules).map((schedule, i) => (
                <div key={i} className="text-center text-xl">
                  {schedules.length > 0 ? `${setUser(schedule.created_by)}${schedule.label !== null ? schedule.label : ""} ${schedule.from_date}日(${getWeekDay(year, month, schedule.from_date)}) ${schedule.from_time}-${schedule.to_time} ${schedule.description}` : "なし"}
                </div>
              ))}
              {anniversaries.map((anniversary, i) => (
                <div key={i} className="text-center text-xl">
                  {anniversaries.length > 0 && anniversary.month === month && anniversary.date === today && `${anniversary.date}日(${getWeekDay(year, month, anniversary.date)}) ${anniversary.description}`}
                </div>
              ))}
              <div className="flex justify-end">
                <TextLink path="/schedule" text="スケジュール一覧へ" />
              </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1 my-1">
          <div className="bg-black text-white p-2">
            <h2 className="text-2xl font-bold mb-4 text-center">在庫切れ情報</h2>
            {inventories.map((inventory, i) => (
              <div key={i} className="text-center text-xl">
                {inventory.name}
              </div>
            ))}
            <div className="flex justify-end">
              <TextLink path="/inventory" text="在庫一覧へ" />
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1">
          <div className="bg-black text-white p-2">
            <h2 className="text-2xl font-bold mb-4 text-center">期限間近・期限切れのタスク</h2>
            {tasks.map((task, i) => (
              <div key={i} className={`flex justify-center text-xl m-1`}>
                {tasks.length > 0 && (isWithinAWeekFromDueDate(task) || isOverDueDate(task)) && `${task.title} (期限: ${task.due_date})`}
              </div>
            ))}
            <div className="flex justify-end">
              <TextLink path="/task" text="タスク一覧へ" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
