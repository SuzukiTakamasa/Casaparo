"use client"

//export const runtime = 'edge'
import { useEffect, useState, useCallback, useContext } from 'react'

import APIClient from '@utils/api_client'
import { InventoryData, InventoryResponse, ShoppingNoteResponse } from '@utils/constants'

import { formatNumberWithCommas } from '@utils/utility_function'
import { PencilIcon, TrashBoxIcon, CheckBadgeIcon } from '@components/HeroicIcons'


const client = new APIClient()


const Inventory = () => {
    const [activeTab, setActiveTab] = useState('inventory')

    const [showInventoryDialog, setShowInventoryDialog] = useState(false)
    const [showShoppingNoteDialog, setShowShoppingNoteDialog] = useState(false)

    const [inventories, setInventories] = useState<InventoryResponse>([])
    const [inventoryId, setInventoryId] = useState(0)
    const [isUpdateInventory, setIsUpdateInventory] = useState(false)
    const [types, setTypes] = useState(0)
    const [name, setName] = useState("")
    const [amount, setAmount] = useState(0)
    const [inventoryCreatedBy, setInventoryCreatedBy] = useState(0)
    const [inventoryVersion, setInventoryVersion] = useState(0)

    const [shoppingNotes, setShoppingNotes] = useState<ShoppingNoteResponse>([])
    const [shoppingNoteId, setShoppingNoteId] = useState(0)
    const [notes, setNotes] = useState("")
    const [isRegistered, setIsRegistered] = useState(false)
    const [shoppingNoteCreatedBy, setShoppingNoteCreatedBy] = useState(0)
    const [shoppingNoteVersion, setShoppingNoteVersion] = useState(0)

    const [isExisting, setIsExisting] = useState(false)
    const [itemCount, setItemCount] = useState(0)


    const fetchInventories = useCallback(async () => {
        const inventories = await client.get<InventoryResponse>("/v2/inventory")
        setInventories(inventories.data || [])
    }, [])
    const addInventory = async () => {
        const addInventoryData = {
            types: types,
            name: name,
            amount: amount,
            created_by: inventoryCreatedBy,
            version: inventoryVersion
        }
        await client.post<InventoryResponse>("/v2/inventory/create", addInventoryData)
        await fetchInventories()
    }
    const updateInventory = async () => {
        const updateInventoryData = {
            id: inventoryId,
            types: types,
            name: name,
            amount: amount,
            created_by: inventoryCreatedBy,
            version: inventoryVersion
        }
        await client.post<InventoryResponse>("/v2/inventory/update", updateInventoryData)
        await fetchInventories()
    }
    const deleteInventory = async (deleteInventoryData: InventoryData) => {
        if (!window.confirm("在庫を削除しますか？")) return
        await client.post<InventoryResponse>("/v2/inventory/delete", deleteInventoryData)
        await fetchInventories()
    }
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