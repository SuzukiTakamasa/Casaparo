"use client"

//export const runtime = 'edge'
import { useEffect, useState, useCallback, useContext } from 'react'
import Link from 'next/link'

import { MonthContext } from './components/MonthPaginator'
import { YearContext } from './components/YearPicker'

import APIClient from './utils/api_client'

import { FixedAmount } from './utils/constants'
import { formatNumberWithCommas } from './utils/utility_function'
import { ArrowRightStartToIcon } from './components/HeroicIcons'


const client = new  APIClient()


export default function Home() {

  const { month } = useContext(MonthContext)
  const { year } = useContext(YearContext)

  const [totalAmount, setTotalAmount] = useState(0)
  const [billingAmount, setBillingAmount] = useState(0)

  const fetchFixedAmount = useCallback(async () => {
    try {
      const fixedAmount = await client.get<FixedAmount>(`/household/fixed_amount/${year}/${month}`)
      if (fixedAmount !== null) {
        setTotalAmount(fixedAmount.total_amount)
        setBillingAmount(fixedAmount.billing_amount)
      } else {
        throw new Error()
      }
      } catch (e) {
        console.error("Failed to feth fixed_amount", e)
      }
  }, [year, month])

   useEffect(() => {
    fetchFixedAmount()
   }, [fetchFixedAmount])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="container max-w-full">
        <h1 className="text-2xl font-bold pb-8">🥺ダッシュボード🥺ྀི</h1>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1">
          <div className="bg-black text-white p-2">
            <h2 className="text-2xl font-bold mb-4 text-center">今月の生活費・各負担分</h2>
            <p className="text-xl mb-2 text-right">{`生活費合計： ¥${formatNumberWithCommas(totalAmount)}`}</p>
            <p className="text-xl mb-2 text-right">{`(🥺ྀི負担分： ¥${formatNumberWithCommas(billingAmount)})`}</p>
            <div className="flex justify-end">
              <Link href="/household" className="flex text-xl text-blue-700 hover:underline">
                <ArrowRightStartToIcon />
                家計簿一覧へ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
