"use client"

//export const runtime = 'edge'
import { useEffect, useState, useCallback, useContext } from 'react'
import Link from 'next/link'

import { MonthContext } from '@components/MonthPaginator'
import { YearContext } from '@components/YearPicker'
import Loader from '@components/Loader'

import APIClient from '@utils/api_client'

import { FixedAmount, ScheduleResponse, AnniversaryResponse } from '@utils/constants'
import { formatNumberWithCommas, setUser } from '@utils/utility_function'
import { ArrowRightStartToIcon } from '@components/HeroicIcons'

import { getWeekDay } from '@utils/utility_function'


const client = new  APIClient()


export default function Home() {

  const { month } = useContext(MonthContext)
  const { year } = useContext(YearContext)

  const [totalAmount, setTotalAmount] = useState(0)
  const [billingAmount, setBillingAmount] = useState(0)
  const [schedules, setSchedules] = useState<ScheduleResponse>([])
  const [anniversaries, setAnniversaries] = useState<AnniversaryResponse>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentDate = new Date().getDate()

  const fetchFixedAmount = useCallback(async () => {
      const fixedAmount = await client.get<FixedAmount>(`/household/fixed_amount/${year}/${month}`)
      if (fixedAmount.data) {
        setTotalAmount(fixedAmount.data.total_amount)
        setBillingAmount(fixedAmount.data.billing_amount)
        setIsLoading(false)
      }
  }, [year, month])
  const fetchSchedules = useCallback(async () => {
    const schedules = await client.get<ScheduleResponse>(`/schedule/today_or_tomorrow/${year}/${month}/${currentDate}`)
    setSchedules(schedules.data || [])
  }, [year, month, currentDate])
  const fetchAnniversaries = useCallback(async() => {
    const anniversaries = await client.get<AnniversaryResponse>('/anniversary')
    setAnniversaries(anniversaries.data || [])
  }, [])

   useEffect(() => {
    fetchFixedAmount()
    fetchSchedules()
    fetchAnniversaries()
   }, [fetchFixedAmount, fetchSchedules, fetchAnniversaries])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="container max-w-full">
        <h1 className="text-2xl font-bold pb-8">🥺ダッシュボード🥺ྀི</h1>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1">
          <div className="bg-black text-white p-2">
            <h2 className="text-2xl font-bold mb-4 text-center">今月の生活費・各負担分</h2>
            <p className="text-xl mb-2 text-right">生活費合計： ¥ {isLoading ? <Loader size={20} isLoading={isLoading} /> : `${formatNumberWithCommas(totalAmount)}`}</p>
            <p className="text-xl mb-2 text-right">(🥺ྀི負担分： ¥ {isLoading ? <Loader size={20} isLoading={isLoading} /> : `${formatNumberWithCommas(billingAmount)}`})</p>
            <div className="flex justify-end">
              <Link href="/household" className="flex text-xl text-blue-500 font-bold hover:underline">
                <ArrowRightStartToIcon />
                家計簿一覧へ
              </Link>
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1 my-1">
          <div className="bg-black text-white p-2">
              <h2 className="text-2xl font-bold mb-4 text-center">今日・明日の予定</h2>
              {schedules.map((schedule, i) => (
                <div key={i} className="text-center text-xl">
                  {schedules.length > 0 ? `${setUser(schedule.created_by)}${schedule.label !== null ? schedule.label : ""} ${schedule.from_date}日(${getWeekDay(year, month, schedule.from_date)}) ${schedule.from_time}-${schedule.to_time} ${schedule.description}` : "なし"}
                </div>
              ))}
              {anniversaries.map((anniversary, i) => (
                <div key={i} className="text-center text-xl">
                  {anniversaries.length > 0 && anniversary.month === month && anniversary.date === currentDate && `${anniversary.description} ${anniversary.date}日(${getWeekDay(year, month, anniversary.date)})`}
                </div>
              ))}
              <div className="flex justify-end">
                <Link href="/schedule" className="flex text-xl text-blue-500 font-bold hover:underline">
                  <ArrowRightStartToIcon />
                  スケジュール一覧へ
                </Link>
              </div>
          </div>
        </div>
      </div>
    </main>
  )
}
