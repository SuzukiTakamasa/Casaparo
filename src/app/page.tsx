"use client"

//export const runtime = 'edge'

import { ReactNode, useEffect, useState, useCallback, useContext } from 'react'

import { MonthContext } from '@components/MonthPaginator'
import { YearContext } from '@components/YearPicker'
import Loader from '@components/Loader'
import { TextLink } from '@components/TextLink'

import { APIClient } from '@utils/api_client'

import { IsCompleted, FixedAmount, ScheduleResponse, AnniversaryResponse, InventoryResponse, TaskResponse } from '@/app/utils/interfaces'
import { formatNumberWithCommas, getToday, getWeekDay, setUser, sortSchedulesByDateTime, isWithinAWeekFromDueDate, isOverDueDate } from '@utils/utility_function'
import { ExclamationTriangleIcon } from '@/app/components/Heroicons'


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
  }, [isCompletedCurrentMonth])
  const fetchIsCompletedLastMonth = useCallback(async () => {
    const pathParams = month === 1 ? `${year - 1}/12` : `${year}/${month - 1}`
    const isCompletedLastMonth = await client.get<IsCompleted>(`/v2/completed_household/${pathParams}`)
    if (isCompletedLastMonth.data) {
      setIsCompletedLastMonth(isCompletedLastMonth.data.is_completed)
    }
  }, [isCompletedLastMonth])

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
          {isCompletedLastMonth === 0 &&
            <div className="flex justify-center bg-red-700">
              <ExclamationTriangleIcon/>
            <p>{`${month === 1 ? `(${year - 1}年)12` : month - 1}月の家計簿がまだ確定されていません。`}</p>
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
        </CardWithTitleAndTextLink>
        <CardWithTitleAndTextLink title="今日・明日の予定" path="/schedule" text="スケジュール一覧へ" margin="my-1">
          <table className="flex justify-center">
            <tbody>
              {sortSchedulesByDateTime(schedules).map((schedule, i) => (
                <div key={i} className="text-xl">
                  {schedules.length > 0 &&
                    <tr>
                      <td>{setUser(schedule.created_by)}</td>
                      <td>{schedule.label !== null ? schedule.label : ""}</td>
                      <td className="pr-4">{schedule.from_date}日({getWeekDay(year, month, schedule.from_date)})</td>
                      <td className="pr-4">{schedule.from_time}-{schedule.to_time}</td>
                      <td>{schedule.description}</td>
                    </tr>
                  }
                </div>
              ))}
              {anniversaries.map((anniversary, i) => (
                <div key={i} className="text-xl">
                  {anniversaries.length > 0 &&
                   anniversary.month === month &&
                   anniversary.date === today ||
                   anniversary.date === today + 1 &&
                    <tr>
                      <td>🎉</td>
                      <td></td>
                      <td className="pr-4">{anniversary.date}日({getWeekDay(year, month, anniversary.date)})</td>
                      <td className="pr-4"></td>
                      <td>{anniversary.description}</td>
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
                <div key={i} className="text-xl">
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
                <div key={i} className="text-xl">
                  {tasks.length > 0 &&
                  (isWithinAWeekFromDueDate(task) ||
                  isOverDueDate(task)) &&
                    <tr>
                      <td className="pr-4">{task.title}</td>
                      <td>(期限: {task.due_date})</td>
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
