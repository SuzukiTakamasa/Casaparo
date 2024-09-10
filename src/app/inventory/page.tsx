"use client"

//export const runtime = 'edge'
import { useEffect, useState, useCallback, useContext } from 'react'

import APIClient from '@utils/api_client'
import { InventoryResponse, ShoppingNoteResponse } from '@utils/constants'


const api_client = new APIClient()


const Inventory = () => {
    const [activeTab, setActiveTab] = useState('inventory')

    const [showInventoryDialog, setShowInventoryDialog] = useState(false)
    const [showShoppingNoteDialog, setShowShoppingNoteDialog] = useState(false)

    const [inventoryId, setInventoryId] = useState(0)
    const [isUpdateInventory, setIsUpdateInventory] = useState(false)
    const [types, setTypes] = useState(0)
    const [name, setName] = useState("")
    const [amount, setAmount] = useState(0)
    const [inventoryCreatedBy, setInventoryCreatedBy] = useState(0)
    const [inventoryVersion, setInventoryVersion] = useState(0)

    const [shoppingNoteId, setShoppingNoteId] = useState(0)
    const [notes, setNotes] = useState("")
    const [isRegistered, setIsRegistered] = useState(false)
    const [shoppingNoteCreatedBy, setShoppingNoteCreatedBy] = useState(0)
    const [shoppingNoteVersion, setShoppingNoteVersion] = useState(0)

    const [isExisting, setIsExisting] = useState(false)
    const [itemCount, setItemCount] = useState(0)

    useEffect(() => {
        if (activeTab === 'shopping note') {
            setActiveTab('inventory')
        }
    }, [])

    return (
        <>
            <h1 className="text-2xl font-bold mc-4">🚨 在庫・買い物メモ 🚨</h1>

            <div className="flex justify-center">
                <button
                    className={`px-4 py-2 text-sm font-medium rounded-t lg border-b-2 ${activeTab === 'inventory' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-transparent nover:bg-gray-100' }`}
                    onClick={() => setActiveTab('inventory')}
                >
                    在庫
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium rounded-t lg border-b-2 ${activeTab === 'shopping note' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-transparent nover:bg-gray-100' }`}
                    onClick={() => setActiveTab('shopping note')}
                >
                    買い物メモ
                </button>
            </div>
        </>
    )
}

export default Inventory