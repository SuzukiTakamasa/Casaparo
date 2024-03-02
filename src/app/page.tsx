"use client"

//export const runtime = 'edge'

import Image from 'next/image'
import { useEffect, useState, useCallback, useContext } from 'react'

import { MonthContext } from './components/MonthPaginator'
import { YearContext } from './components/YearPicker'

import APIClient from './utils/api_client'

import { FixedAmount } from './utils/constants'


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
    <main className="flex min-h-screen flex-col items-center justify-between py-4">
      <div className="container max-w-full">
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1">
          <div className="bg-black text-white p-2">
            <h2 className="text-2xl font-bold mb-4 text-center">🥺 今月の生活費・請求金額 🥺ྀི</h2>
            <p className="text-xl mb-2 text-right">{`生活費合計： ¥${totalAmount}`}</p>
            <p className="text-xl mb-2 text-right">{`請求金額： ¥${billingAmount}`}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
