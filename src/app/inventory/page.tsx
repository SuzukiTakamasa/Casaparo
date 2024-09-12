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

    const [typesValisMsg, setTypesValidMsg] = useState("")
    const [nameValidMsg, setNameValidMsg] = useState("")
    const [inventoryCreatedByValidMsg, setInventoryCreatedByValidMsg] = useState("")

    const [shoppingNoteCreatedByValidMsg, setShoppingNoteCreatedByValidMsg] = useState("")

    const [inventories, setInventories] = useState<InventoryResponse>([])
    const [inventoryId, setInventoryId] = useState(0)
    const [isUpdateInventory, setIsUpdateInventory] = useState(false)
    const [types, setTypes] = useState(0)
    const [name, setName] = useState("")
    const [amount, setAmount] = useState(0)
    const [inventoryCreatedBy, setInventoryCreatedBy] = useState<number|null>(null)
    const [inventoryVersion, setInventoryVersion] = useState(1)

    const [shoppingNotes, setShoppingNotes] = useState<ShoppingNoteResponse>([])
    const [shoppingNoteId, setShoppingNoteId] = useState(0)
    const [notes, setNotes] = useState("")
    const [isRegistered, setIsRegistered] = useState(false)
    const [shoppingNoteCreatedBy, setShoppingNoteCreatedBy] = useState(0)
    const [shoppingNoteVersion, setShoppingNoteVersion] = useState(1)

    const [isExisting, setIsExisting] = useState(false)
    const [itemCount, setItemCount] = useState(0)

    const validateInventory = () => {
        let isValid = true
        if (types === 0) {
            isValid = false
            setTypesValidMsg("用途を選んでください。")
        }
        if (name === "") {
            isValid = false
            setNameValidMsg("項目名を入力してください。")
        }
        if (inventoryCreatedBy === null) {
            isValid = false
            setInventoryCreatedByValidMsg("いずれかの登録者を選択してください。")
        }
        return isValid
    }

    const handleAddInventory = async () => {
        if (!validateInventory()) return
        await addInventory()
        handleCloseInventoryDialog()
    }
    const handleUpdateInventory = async () => {
        if (!validateInventory()) return
        await updateInventory()
        handleCloseInventoryDialog()
    }
    const handleOpenInventoryDialog = () => {
        setShowInventoryDialog(true)
    }
    const handleOpenUpdateInventoryDialog = ({id, types, name, amount, created_by, version}: InventoryData) => {
        setShowInventoryDialog(true)
        setInventoryId(id as number)
        setTypes(types)
        setName(name)
        setAmount(amount)
        setInventoryCreatedBy(created_by)
        setInventoryVersion(1)
        setIsUpdateInventory(true)
        setInventoryVersion(version)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseInventoryDialog = () => {
        setShowInventoryDialog(false)
        setInventoryId(0)
        setTypes(0)
        setName("")
        setAmount(0)
        setInventoryCreatedBy(null)
        setInventoryVersion(1)
    }

    const fetchInventories = useCallback(async () => {
        const inventories = await client.get<InventoryResponse>("/v2/inventory")
        setInventories(inventories.data || [])
    }, [])
    const addInventory = async () => {
        const addInventoryData = {
            types: types,
            name: name,
            amount: amount,
            created_by: inventoryCreatedBy as number,
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
            created_by: inventoryCreatedBy as number,
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

            <div className="container mx-auto p-4">
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

                {activeTab === "inventory" &&
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                        onClick={handleOpenInventoryDialog}
                    >
                    在庫を登録
                    </button>
                    <table className="table-auto min-w-full mt-4">
                        <thead>
                            <tr>
                                <th className="border-b-2 py-1 bg-blue-900">種別</th>
                                <th className="border-b-2 py-1 bg-blue-900">項目名</th>
                                <th className="border-b-2 py-1 bg-blue-900">個数</th>
                                <th className="border-b-2 py-1 bg-blue-900">登録者</th>
                            </tr>
                        </thead>
                        <tbody>
                        {inventories.map((iv, i) => (
                            <tr key={i}>
                                <td className="border-b px-1 py-1 text-center">{iv.types}</td>
                                <td className="border-b px-1 py-1 text-center">{iv.name}</td>
                                <td className="border-b px-1 py-1 text-center">{iv.amount}</td>
                                <td className="border-b px-1 py-1 text-center">{iv.created_by}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
                }
                {activeTab === "shopping note" &&
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                        onClick={handleOpenInventoryDialog}
                    >
                    買い物メモを登録
                    </button>
                    {shoppingNotes.map((s, i) => (
                        <div key={i}>
                            <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1 my-1">
                                <div className="bg-black text-white p-2">
                                </div>
                            </div>
                        </div>
                    ))}
                </>
                }
            </div>
        </>
    )
}

export default Inventory