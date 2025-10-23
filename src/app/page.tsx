"use client"

//export const runtime = 'edge'

import { ReactNode, useEffect, useState, useCallback, useContext } from 'react'

import { MonthContext } from '@components/MonthPaginator'
import { YearContext } from '@components/YearPicker'
import Loader from '@components/Loader'
import { TextLink } from '@components/TextLink'

import { APIClient } from '@utils/api_client'

import { IsCompleted, FixedAmount, ScheduleResponse, AnniversaryResponse, InventoryResponse, TaskResponse } from '@utils/interfaces'
import { formatNumberWithCommas, getToday, getWeekDay, setCreatedByStr, sortSchedulesByFromDate, sortSchedulesByTime, isWithinAWeekFromDueDate, isOverDueDate } from '@utils/utility_function'
import { HouseholdConstants, DateOfFixedHousehold, TaskConstants } from '@utils/constants' 
import { ExclamationTriangleIcon } from '@components/Heroicons'


const client = new  APIClient()

type CardWithTitleAndTextLinkProps = {
  title: string
  path: string
  text: string,
  margin?: string,
  children: ReactNode
}

const CardWithTitleAndTextLink = ({ title, path, text, margin, children }: CardWithTitleAndTextLinkProps) => {
  return (
    <div className={`rounded-lg overflow-hidden shadow-lg bg-white p-1 ${margin}`}>
      <div className="bg-black text-white p-2">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        {children}
        <div className="flex justify-end">
          <TextLink path={path} text={text} />
        </div>
      </div>
    </div>
  )
}

export default function Home() {

  const { month } = useContext(MonthContext)
  const { year } = useContext(YearContext)

  const [fixedAmount, setFixedAmount] = useState<FixedAmount>({ billing_amount: 0, total_amount: 0})
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
        setFixedAmount(fixedAmount.data)
        setIsLoading(false)
      }
  }, [year, month])
  const fetchSchedules = useCallback(async () => {
    const schedules = await client.get<ScheduleResponse>(`/v2/schedule/today_or_tomorrow/${year}/${month}/${today}`)
    setSchedules(schedules.data || [])
  }, [year, month, today])
  const fetchAnniversaries = useCallback(async() => {
    const anniversaries = await client.get<AnniversaryResponse>(`/v2/anniversary/today_or_tomorrow/${month}/${today}`)
    setAnniversaries(anniversaries.data || [])
  }, [])
  const fetchInventories = useCallback(async () => {
    const inventories = await client.get<InventoryResponse>('/v2/inventory/empty')
    setInventories(inventories.data || [])
  }, [])
  const fetchTasks = useCallback(async () => {
    const tasks = await client.get<TaskResponse>('/v2/task/not_completed')
    setTasks(tasks.data || [])
  }, [])
  const fetchIsCompletedCurrentMonth = useCallback(async () => {
    const isCompletedCurrentMonth = await client.get<IsCompleted>(`/v2/completed_household/${year}/${month}`)
    if (isCompletedCurrentMonth.data) {
      setIsCompletedCurrentMonth(isCompletedCurrentMonth.data.is_completed)
    }
  }, [year, month])
  const fetchIsCompletedLastMonth = useCallback(async () => {
    const pathParams = month === 1 ? `${year - 1}/12` : `${year}/${month - 1}`
    const isCompletedLastMonth = await client.get<IsCompleted>(`/v2/completed_household/${pathParams}`)
    if (isCompletedLastMonth.data) {
      setIsCompletedLastMonth(isCompletedLastMonth.data.is_completed)
    }
  }, [year, month])

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
        <CardWithTitleAndTextLink title="今月の生活費・各負担分" path="/household" text="家計簿一覧へ">
          {isCompletedLastMonth === HouseholdConstants.IsCompleted.NOT_COMPLETED &&
            <div className="flex justify-center bg-red-700 text-xl">
              <ExclamationTriangleIcon/>
            <p>{`${month === 1 ? `(${year - 1}年)12` : month - 1}月の家計簿がまだ確定されていません。`}</p>
            </div>
          }
          {(isCompletedCurrentMonth === HouseholdConstants.IsCompleted.NOT_COMPLETED && today >= DateOfFixedHousehold) &&
          <div className="flex justify-center bg-yellow-700 text-xl">
            <ExclamationTriangleIcon/>
            <p>{`${month}月の家計簿を確定してください。`}</p>
          </div>
          }
          <p className="text-xl mb-2 text-right">生活費合計： ¥ {isLoading ? <Loader size={20} isLoading={isLoading} /> : `${formatNumberWithCommas(fixedAmount.total_amount)}`}</p>
          <p className="text-xl mb-2 text-right">(🥺ྀི負担分： ¥ {isLoading ? <Loader size={20} isLoading={isLoading} /> : `${formatNumberWithCommas(fixedAmount.billing_amount)}`})</p>
        </CardWithTitleAndTextLink>
        <CardWithTitleAndTextLink title="今日・明日の予定" path="/schedule" text="スケジュール一覧へ" margin="my-1">
          <table className="flex justify-center">
            <tbody>
              {sortSchedulesByFromDate(sortSchedulesByTime(schedules)).map((schedule, i) => (
                <div key={i} className="text-lg">
                  {schedules.length > 0 &&
                    <tr>
                      <td>
                        {setCreatedByStr(schedule.created_by)} {schedule.from_date}日({getWeekDay(year, month, schedule.from_date)}) {schedule.from_time}-{schedule.to_time} {schedule.description}
                      </td>
                    </tr>
                  }
                </div>
              ))}
              {anniversaries.map((anniversary, i) => (
                <div key={i} className="text-lg">
                  {anniversaries.length > 0 &&
                    <tr>
                      <td>🎉 {anniversary.date}日({getWeekDay(year, month, anniversary.date)}) {anniversary.description}</td>
                    </tr>
                  }
                </div>
              ))}
            </tbody>
          </table>
        </CardWithTitleAndTextLink>
        <CardWithTitleAndTextLink title="在庫切れ情報" path="/inventory" text="在庫一覧へ" margin="my-1">
          <table className="flex justify-center">
            <tbody>
              {inventories.map((inventory, i) => (
                <div key={i} className="text-lg">
                  <tr> 
                    <td>{inventory.name}</td>
                  </tr>
                </div>
              ))}
            </tbody>
          </table>
        </CardWithTitleAndTextLink>
        <CardWithTitleAndTextLink title="期限間近・期限切れのタスク" path="/task" text="タスク一覧へ">
          <table className="flex justify-center">
            <tbody>
              {tasks.map((task, i) => (
                <div key={i} className="text-lg">
                  {tasks.length > 0 &&
                  (isWithinAWeekFromDueDate(task) ||
                  isOverDueDate(task)) &&
                    <tr>
                      <td className="pr-2">{task.title} (期限: {task.due_date})</td>
                    </tr>
                  }
                </div>
              ))}
            </tbody>
          </table>
        </CardWithTitleAndTextLink>
      </div>
    </main>
  )
}
