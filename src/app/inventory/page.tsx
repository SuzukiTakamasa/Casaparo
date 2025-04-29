"use client"

//export const runtime = 'edge'

import { useEffect, useState, useCallback, useContext } from 'react'

import { APIClient } from '@utils/api_client'
import { InventoryData, InventoryResponse, InventoryTypeResponse, ShoppingNoteData, ExtractedShoppingNoteData, ExtractedShoppingNoteResponse } from '@/app/utils/interfaces'

import { adaptTwoPointReader, setUser, boolToInt, intToBool } from '@utils/utility_function'
import { CheckBadgeIcon, PlusIcon, MinusIcon } from '@/app/components/Heroicons'
import { EditButton, DeleteButton } from '@/app/components/Buttons'
import { ToasterComponent, APIResponseToast } from '@components/ToastMessage'
import GeneralPaginator, { GeneralPaginationContext, GeneralPaginationProvider, getFirstAndLastDataIndexPerPage } from '@components/GeneralPaginator'


const client = new APIClient()


const Inventory = () => {
    const [activeTab, setActiveTab] = useState('inventory')

    const [showInventoryDialog, setShowInventoryDialog] = useState(false)
    const [showShoppingNoteDialog, setShowShoppingNoteDialog] = useState(false)

    const [typesValidMsg, setTypesValidMsg] = useState("")
    const [nameValidMsg, setNameValidMsg] = useState("")
    const [isIncludedInYetToRegisterShoppingNoteMsg, setIsIncludedInYetToRegisterShoppingNoteMsg] = useState("")

    const [inventories, setInventories] = useState<InventoryResponse>([])
    const [inventoryId, setInventoryId] = useState(0)
    const [isUpdateInventory, setIsUpdateInventory] = useState(false)
    const [types, setTypes] = useState(0)
    const [typesForSort, setTypesForSort] = useState(0)
    const [name, setName] = useState("")
    const [amount, setAmount] = useState(0)
    const [inventoryCreatedBy, setInventoryCreatedBy] = useState(1)
    const [inventoryVersion, setInventoryVersion] = useState(1)

    const [inventoryTypes, setInventoryTypes] = useState<InventoryTypeResponse>([])

    const [noteTypesValidMsg, setNoteTypesValidMsg] = useState("")
    const [noteNameValidMsg, setNoteNameValidMsg] = useState("")
    const [noZeroAmountInventoryErrMsg, setNoZeroAmountInventoryErrMsg] = useState("")

    const [shoppingNotes, setShoppingNotes] = useState<ExtractedShoppingNoteResponse[]>([])
    const [shoppingNoteId, setShoppingNoteId] = useState(0)
    const [isUpdateShoppingNote, setIsUpdateShoppingNote] = useState(false)
    const [notes, setNotes] = useState<InventoryData[]>([{id: 0, types: 0, name: "", amount: 0, created_by: 1, version: 1}])
    const [isRegistered, setIsRegistered] = useState(false)
    const [shoppingNoteCreatedBy, setShoppingNoteCreatedBy] = useState(1)
    const [shoppingNoteVersion, setShoppingNoteVersion] = useState(1)

    const [isExisting, setIsExisting] = useState<boolean[]>([false])

    const { page } = useContext(GeneralPaginationContext)
    const [pagination, setPagination] = useState(page)

    const numberOfDataPerPage = 10
    const [firstDataIndexPerPage, lastDataIndexPerPage] = getFirstAndLastDataIndexPerPage(pagination, numberOfDataPerPage)

    const [isDisplayedRegisteredShoppingNotes, setIsDisplayedRegisteredShoppingNotes] = useState(false)

    const setInventoryTypesStr = (types: number) => {
        return inventoryTypes.filter(i => i.id === types)[0]?.types ?? "-"
    }

    const validateInventory = () => {
        let isValid = true
        if (types === 0) {
            isValid = false
            setTypesValidMsg("種別を選択してください。")
        }
        if (name === "") {
            isValid = false
            setNameValidMsg("項目名を入力してください。")
        }
        if (isUpdateInventory && isYetToRegisterToInventory(inventoryId)) {
            isValid = false
            setIsIncludedInYetToRegisterShoppingNoteMsg("在庫未登録の買い物メモで選択中のため編集できません。")
        }
        return isValid
    }

    const validateShoppingNote = () => {
        let isValid = true
        for (const note of notes) {
            if (note.types === 0) {
                isValid = false
                setNoteTypesValidMsg("種別を選択してください。")
            }
            if (note.name === "") {
                isValid = false
                setNoteNameValidMsg("項目名を入力してください。")
            }
        }
        return isValid
    }

    const handleAddInventory = async () => {
        if (!validateInventory()) return
        const response = await addInventory()
        handleCloseInventoryDialog()
        APIResponseToast(response, "在庫を登録しました。", "在庫の登録に失敗しました。")
    }
    const handleUpdateInventory = async () => {
        if (!validateInventory()) return
        const response = await updateInventory()
        handleCloseInventoryDialog()
        APIResponseToast(response, "在庫を変更しました。", "在庫の変更に失敗しました。")
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
        setInventoryVersion(version)
        setIsUpdateInventory(true)
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
        setInventoryCreatedBy(1)
        setInventoryVersion(1)
        setIsUpdateInventory(false)
        setTypesValidMsg("")
        setNameValidMsg("")
        setIsIncludedInYetToRegisterShoppingNoteMsg("")
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
        const response = await client.post<InventoryData>("/v2/inventory/create", addInventoryData)
        await fetchInventories()
        return response
    }
    const fetchInventoryTypes = useCallback(async () => {
        const inventoryTypes = await client.get<InventoryTypeResponse>("/v2/inventory_type")
        setInventoryTypes(inventoryTypes.data || [])
    }, [])
    const updateInventory = async () => {
        const updateInventoryData = {
            id: inventoryId,
            types: types,
            name: name,
            amount: amount,
            created_by: inventoryCreatedBy as number,
            version: inventoryVersion
        }
        const response = await client.post<InventoryData>("/v2/inventory/update", updateInventoryData)
        await fetchInventories()
        return response
    }
    const deleteInventory = async (deleteInventoryData: InventoryData) => {
        if (!window.confirm("在庫を削除しますか？")) return
        if (!isUpdateInventory && deleteInventoryData.id && isYetToRegisterToInventory(deleteInventoryData.id)) {
            setIsIncludedInYetToRegisterShoppingNoteMsg("在庫未登録の買い物メモで選択中のため削除できません。")
            return
        }
        const response = await client.post<InventoryData>("/v2/inventory/delete", deleteInventoryData)
        APIResponseToast(response, "在庫を削除しました。", "在庫の削除に失敗しました。")
        await fetchInventories()
    }
    const handleInventoryIncrementAmount = () => {
        setAmount(amount => amount + 1)
    }
    const handleInventoryDecrementAmount = () => {
        setAmount(amount => amount - 1)
    }
    const handleDisaplySelectedTypeOfInventories = (inventory: InventoryResponse) => {
        return (
            typesForSort === 0 ?
            inventory :
            inventory.filter(i => i.types === typesForSort)
        )
    }

    const handleAddShoppingNote = async () => {
        if (!validateShoppingNote()) return
        const response = await addShoppingNote()
        handleCloseShoppingNoteDialog()
        APIResponseToast(response, "買い物メモを登録しました。", "買い物メモの登録に失敗しました。")
    }
    const handleUpdateShoppingNote = async () => {
        if (!validateShoppingNote()) return
        const response = await updateShoppingNote()
        handleCloseShoppingNoteDialog()
        APIResponseToast(response, "買い物メモを変更しました。", "買い物メモの変更に失敗しました。")
    }
    const handleOpenShoppingNoteDialog = () => {
        setShowShoppingNoteDialog(true)
    }
    const handleOpenUpdateShoppingNoteDialog = ({id, notes, is_registered, created_by, version}: ShoppingNoteData) => {
        const parsedNotes = JSON.parse(notes)
        setShowShoppingNoteDialog(true)
        setShoppingNoteId(id as number)
        setNotes(parsedNotes)
        setIsRegistered(intToBool(is_registered))
        setShoppingNoteCreatedBy(created_by)
        setShoppingNoteVersion(version)
        setIsUpdateShoppingNote(true)
        parsedNotes.forEach((note: InventoryData, i: number)  => {
            setIsExisting(prevIsExisting => {
                const newIsExisting = [...prevIsExisting]
                newIsExisting[i] = note.id !== 0
                return newIsExisting
            })
        })
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const handleCloseShoppingNoteDialog = () => {
        setShowShoppingNoteDialog(false)
        setShoppingNoteId(0)
        setNotes([{id: 0, types: 0, name: "", amount: 0, created_by: 0, version: 1}])
        setIsRegistered(false)
        setShoppingNoteCreatedBy(1)
        setShoppingNoteVersion(1)
        setIsUpdateShoppingNote(false)
        setIsExisting([false])
        setNoteTypesValidMsg("")
        setNoteNameValidMsg("")
        setNoZeroAmountInventoryErrMsg("")
    }
    const handleSetIsExisting = (index: number) => {
        setIsExisting(prevIsExisting => {
            const newIsExisting = [...prevIsExisting]
            newIsExisting[index] = !newIsExisting[index]
            return newIsExisting
        })
    }
    const handleSetNoteType = (index: number, noteTypes: number) => {
        setNotes(prevNotes => {
            const newNotes = [...prevNotes]
            newNotes[index].types = noteTypes
            return newNotes
        })
    }
    const handleSetNoteName = (index: number, noteName: string) => {
        setNotes(prevNotes => {
            const newNotes = [...prevNotes]
            newNotes[index].name = noteName
            return newNotes
        })
    }
    const handleSetNoteExistingName = (index: number, id: string) => {
        setNotes(prevNotes => {
            const newNotes = [...prevNotes]
            const matchedInventory = inventories.filter(i => i.id === Number(id))[0]
            newNotes[index].name = matchedInventory?.name ?? ""
            newNotes[index].id = matchedInventory?.id ?? 0
            newNotes[index].types = matchedInventory?.types ?? 0
            newNotes[index].created_by = matchedInventory?.created_by ?? 1
            newNotes[index].version = matchedInventory?.version ?? 1
            return newNotes
        })
    }
    const handleSetNoteAmount = (index: number, noteAmount: number) => {
        setNotes(prevNotes => {
            const newNotes = [...prevNotes]
            newNotes[index].amount = noteAmount
            return newNotes
        })
    }
    const handleShoppingNoteIncrementAmount = (index: number) => {
        setNotes(prevNotes => {
            const newNotes = [...prevNotes]
            newNotes[index] = {
                ...newNotes[index],
                amount: newNotes[index].amount + 1
            }
            return newNotes
        })
    }
    const handleShoppingNoteDecrementAmount = (index: number) => {
        setNotes(prevNotes => {
            const newNotes = [...prevNotes]
            newNotes[index] = {
                ...newNotes[index],
                amount: newNotes[index].amount - 1
            }
            return newNotes
        })
    }
    const handleSetShoppingNoteCreatedBy = (createdBy: number) => {
        setShoppingNoteCreatedBy(createdBy)
        setNotes(prevNotes => {
            const newNotes = [...prevNotes]
            newNotes.filter(n => n.id === 0)
                    .map(n => n.created_by = createdBy)
            return newNotes
        })
    }
    const handleAddNote = () => {
        setNotes([...notes, {id: 0, types: 0, name: "", amount: 0, created_by: 1, version: 1}])
        setIsExisting([...isExisting, false])
    }
    const handleAddItemsInventoryAmountIsZero = () => {
        const itemsInventoryAmountIsZero = inventories.filter(i => i.amount === 0)
        if (itemsInventoryAmountIsZero.length !== 0) {
            setNotes([])
            setIsExisting([])
            setNotes(itemsInventoryAmountIsZero)
            const newIsExisting: boolean[] = []
            for (const _ of itemsInventoryAmountIsZero) {
                newIsExisting.push(true)
            }
            setIsExisting(newIsExisting)
        } else {
            setNoZeroAmountInventoryErrMsg("在庫切れのアイテムは現在ありません。")
        }
    }
    const handleRemoveNote = () => {
        setNotes(notes.slice(0, -1))
        setIsExisting(isExisting.slice(0, -1))
    }

    const fetchShoppingNotes = useCallback(async () => {
        const extractedShoppingNotes = await client.get<ExtractedShoppingNoteResponse>("/v2/shopping_note")
        if (extractedShoppingNotes.data) {
          const groupedNotes = extractedShoppingNotes.data.reduce((acc: { [key: number]: ExtractedShoppingNoteData[] }, note) => {
            if (!acc[note.id]) {
              acc[note.id] = []
            }
            acc[note.id].push(note)
            return acc
          }, {})
          const sortGroupedNotes = (groupedNotes: ExtractedShoppingNoteData[][], isRegistered: number) => {
            const newGroupedNotes = groupedNotes.filter(n => n[0].is_registered === isRegistered)
            return newGroupedNotes.sort((a, b) => b[0].id - a[0].id)
          }
          const groupedNotesNotIsRegistered = sortGroupedNotes(Object.values(groupedNotes), 0)
          const groupedNotesIsRegistered = sortGroupedNotes(Object.values(groupedNotes), 1)
          const groupedNotesSortedByIsRegistered = groupedNotesNotIsRegistered.concat(groupedNotesIsRegistered)
          setShoppingNotes(groupedNotesSortedByIsRegistered)
        }
      }, [])
    const addShoppingNote = async () => {
        const addShoppingNoteData = {
            notes: JSON.stringify(notes),
            is_registered: boolToInt(isRegistered),
            created_by: shoppingNoteCreatedBy,
            version: shoppingNoteVersion
        }
        const response = await client.post<ShoppingNoteData>("/v2/shopping_note/create", addShoppingNoteData)
        await fetchShoppingNotes()
        return response
    }
    const updateShoppingNote = async () => {
        const updateShoppingNoteData = {
            id: shoppingNoteId,
            notes: JSON.stringify(notes),
            is_registered: boolToInt(isRegistered),
            created_by: shoppingNoteCreatedBy,
            version: shoppingNoteVersion
        }
        const response = await client.post<ShoppingNoteData>("/v2/shopping_note/update", updateShoppingNoteData)
        await fetchShoppingNotes()
        return response
    }
    const deleteShoppingNote = async (deleteShoppingNoteData: ShoppingNoteData) => {
        if (!window.confirm("買い物メモを削除しますか？")) return
        const response = await client.post<ShoppingNoteData>("/v2/shopping_note/delete", deleteShoppingNoteData)
        APIResponseToast(response, "買い物メモを削除しました。", "買い物メモの削除に失敗しました。")
        await fetchShoppingNotes()
    }
    /*const registerToInventory = async (registerToInventoryShoppingNote: ShoppingNoteData) => {
        if (!window.confirm("買い物メモの内容を在庫に登録しますか？")) return
        await client.post<ShoppingNoteData>("/v2/shopping_note/register_to_inventory", registerToInventoryShoppingNote)
        await fetchShoppingNotes()
    }
    */
    const completeShoppingNote = async (registerToInventoryShoppingNote: ShoppingNoteData) => {
        const response = await client.post<ShoppingNoteData>("/v2/shopping_note/register_to_inventory", registerToInventoryShoppingNote)
        await fetchShoppingNotes()
        await fetchInventories()
        return response
    }
    const handleCompleteShoppingNote = async (registerToInventoryShoppingNote: ShoppingNoteData) => {
        if (!window.confirm("在庫に登録せずに完了としますか？")) return
        const response = await completeShoppingNote(registerToInventoryShoppingNote)
        APIResponseToast(response, "買い物メモのステータスを「完了」に更新しました。", "買い物メモのステータスの更新に失敗しました。")
    }
    const registerToInventoryTemp = async (registerToInventoryShoppingNote: ShoppingNoteData) => {
        if (!window.confirm("買い物メモの内容を在庫に登録しますか？")) return
        const promises = JSON.parse(registerToInventoryShoppingNote.notes).map((request: InventoryData) => {
            client.post<InventoryData>(`/v2/inventory/${request.id === 0 ? "create" : "update_amount"}`, request)
        })
        await Promise.all(promises)
        const response = await completeShoppingNote(registerToInventoryShoppingNote)
        APIResponseToast(response, "買い物メモの内容を在庫に登録しました。", "買い物メモの内容の在庫登録に失敗しました。")
    }

    const handleFilterShoppingNotesWithPagination = (shoppingNotes: ExtractedShoppingNoteResponse[]) => {
        return (
            shoppingNotes.length >= lastDataIndexPerPage ?
            shoppingNotes.slice(firstDataIndexPerPage - 1, lastDataIndexPerPage) :
            shoppingNotes.slice(firstDataIndexPerPage - 1)
        )
    }
    const handleIsDisplayedRegisteredShoppingNotes = () => {
        setIsDisplayedRegisteredShoppingNotes(!isDisplayedRegisteredShoppingNotes)
    }
    const handleDisplayShoppingNotes = (shoppingNotes: ExtractedShoppingNoteResponse[]) => {
        return (
            isDisplayedRegisteredShoppingNotes ?
            shoppingNotes
            :
            shoppingNotes.filter(s => s[0].is_registered === 0)
        )
    }
    const isYetToRegisterToInventory = (id: number) => {
        const yetToRegisterToInventory = shoppingNotes.map(s => s.filter(i => i.is_registered === 0))
        let isIncluded = false
        for (const y of yetToRegisterToInventory) {
            for (const i of Object.values(y)) {
                if (i.note_id === id) {
                    isIncluded = true
                    return isIncluded
                }
            }
        }
        return isIncluded
    }

    useEffect(() => {
        fetchInventories()
        fetchInventoryTypes()
        fetchShoppingNotes()
    }, [fetchInventories, fetchInventoryTypes, fetchShoppingNotes])

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
                    <div className="flex justify-left">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 mt-4"
                            onClick={handleOpenInventoryDialog}
                        >
                        在庫を登録
                        </button>

                        <div className="ml-4 mt-4">
                            <select
                                value={typesForSort}
                                onChange={(e) => {setTypesForSort(Number(e.target.value))}}
                                className="form-select block w-full px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-int-out m-0 focs:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                            >
                                <option value={0}>種別を選択</option>
                                {inventoryTypes.map((inventoryType, i) => (
                                    <option key={i} value={inventoryType.id}>{inventoryType.types}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {showInventoryDialog && (
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-4 rounded">
                                <div className="flex flex-col space-y-4 mb-4">
                                    <label className="text-black">
                                        <span>種別</span>
                                        <select
                                            className="block w-full px-4 py-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                                            value={types}
                                            onChange={e => setTypes(Number(e.target.value))}
                                        >
                                            <option value={0}>種別を選択</option>
                                            {inventoryTypes.map((inventoryType, i) => (
                                                <option key={i} value={inventoryType.id}>{inventoryType.types}</option>
                                            ))}
                                        </select>
                                    </label>
                                    {typesValidMsg !== "" && <div className="text-sm text-red-500">{typesValidMsg}</div>}
                                    <input
                                        className="border p-2 text-black"
                                        type="text"
                                        placeholder="項目名"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    >
                                    </input>
                                    {nameValidMsg !== "" && <div className="text-sm text-red-500">{nameValidMsg}</div>}
                                    {isIncludedInYetToRegisterShoppingNoteMsg !== "" && <div className="text-sm text-red-500">{isIncludedInYetToRegisterShoppingNoteMsg}</div>}
                                    <div className="flex justify-center">
                                        <button
                                            className={`${amount === 0 ? "text-gray-300" : "text-blue-700"} mr-1`}
                                            onClick={handleInventoryDecrementAmount}
                                            disabled={amount === 0}
                                        >
                                        <MinusIcon/>
                                        </button>
                                        <input
                                            className="border p-2 text-black text-right w-1/4"
                                            type="text"
                                            placeholder="個数"
                                            value={amount}
                                            onChange={e => setAmount(Number(e.target.value))}
                                        >
                                        </input>
                                        <button
                                            className="text-blue-700 ml-1"
                                            onClick={handleInventoryIncrementAmount}
                                        >
                                        <PlusIcon/>
                                        </button>
                                    </div>
                                    <div className="text-black">登録者</div>
                                    <div className="text-3xl text-center">
                                        <input
                                            type="radio"
                                            value="1"
                                            checked={inventoryCreatedBy === 1}
                                            onChange={e => setInventoryCreatedBy(Number(e.target.value))}
                                        />
                                        <span className="mr-8">🥺</span>
                                        <input
                                            type="radio"
                                            value="0"
                                            checked={inventoryCreatedBy === 0}
                                            onChange={e => setInventoryCreatedBy(Number(e.target.value))}
                                        />
                                        <span>🥺ྀི</span>
                                    </div>
                                </div>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={isUpdateInventory ? handleUpdateInventory : handleAddInventory}
                                    >
                                        {isUpdateInventory ? "変更" : "登録"}
                                    </button>
                                    <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleCloseInventoryDialog}
                                    >
                                        キャンセル
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {!isUpdateInventory && isIncludedInYetToRegisterShoppingNoteMsg !== "" && <div className="text-sm text-red-500 text-left">{isIncludedInYetToRegisterShoppingNoteMsg}</div>}
                    <table className="table-auto min-w-full mt-4">
                        <thead>
                            <tr>
                                <th className="border-b-2 py-1 bg-blue-900"></th>
                                <th className="border-b-2 py-1 bg-blue-900 text-sm">種別</th>
                                <th className="border-b-2 py-1 bg-blue-900 text-sm">項目名</th>
                                <th className="border-b-2 py-1 bg-blue-900 text-sm">個数</th>
                                <th className="border-b-2 py-1 bg-blue-900 text-sm">登録者</th>
                            </tr>
                        </thead>
                        <tbody>
                        {handleDisaplySelectedTypeOfInventories(inventories).map((inventory, i) => (
                            <tr key={i} className={`${inventory.amount === 0 && "bg-red-900"}`}>
                                <td className="border-b py-1 flex-row justify-center items-center space-x-1">
                                    <EditButton
                                        onClick={() => handleOpenUpdateInventoryDialog({
                                            id: inventory.id,
                                            types: inventory.types,
                                            name: inventory.name,
                                            amount: inventory.amount,
                                            created_by: inventory.created_by,
                                            version: inventory.version
                                    })}/>
                                    <DeleteButton
                                        onClick={() => deleteInventory({
                                            id: inventory.id,
                                            types: inventory.types,
                                            name: inventory.name,
                                            amount: inventory.amount,
                                            created_by: inventory.created_by,
                                            version: inventory.version
                                        })}
                                    />
                                </td>
                                <td className="border-b px-1 py-1 text-center text-sm">{setInventoryTypesStr(inventory.types)}</td>
                                <td className="border-b px-1 py-1 text-center text-sm">{adaptTwoPointReader(inventory.name, 10)}</td>
                                <td className="border-b px-1 py-1 text-center text-sm">{inventory.amount}</td>
                                <td className="border-b px-1 py-1 text-center text-sm">{setUser(inventory.created_by)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
                }
                {activeTab === "shopping note" &&
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 mt-4"
                        onClick={handleOpenShoppingNoteDialog}
                    >
                    買い物メモを登録
                    </button>
                    <input
                        className="ml-8 mr-2"
                        type="checkbox"
                        checked={isDisplayedRegisteredShoppingNotes}
                        onChange={handleIsDisplayedRegisteredShoppingNotes}
                    />
                    <span>登録済みを表示</span>

                    <GeneralPaginationProvider page={pagination} setPage={setPagination}>
                        <GeneralPaginator numberOfDataPerPage={numberOfDataPerPage} numberOfData={handleDisplayShoppingNotes(shoppingNotes).length} cssStr="text-lg font-bold mx-4" />
                    </GeneralPaginationProvider>

                    {showShoppingNoteDialog && (
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-4 rounded">
                                <div className="flex flex-col space-y-4 mb-4">
                                    <label className="flex items-center space-x-2 text-black">
                                        <span>既存在庫の更新</span>
                                    </label>
                                     {notes.map((note, i) => (
                                        <>
                                            <div key={i} className="flex justify-left">
                                                <input
                                                    className="mr-1"
                                                    type="checkbox"
                                                    checked={isExisting[i]}
                                                    onChange={_ => handleSetIsExisting(i)}
                                                />
                                                <label className="text-black">
                                                    <select
                                                        className={`block ${isExisting[i] ? "bg-gray-500" : "bg-white"} border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50`}
                                                        value={note.types}
                                                        onChange={(e) => handleSetNoteType(i, Number(e.target.value))}
                                                        disabled={isExisting[i]}
                                                    >
                                                        <option value={0}>種別を選択</option>
                                                        {inventoryTypes.map((inventoryType, i) => (
                                                            <option key={i} value={inventoryType.id}>{inventoryType.types}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                                {isExisting[i] ?
                                                <label className="text-black">
                                                    <select
                                                        className="block bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50 ml-1"
                                                        value={note.id}
                                                        onChange={(e) => handleSetNoteExistingName(i, e.target.value)}
                                                    >
                                                        <option value="">項目を選択</option>
                                                        {inventories.map((inventory, i) => (
                                                            <option key={i} value={inventory.id}>{inventory.name}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                                :
                                                <input
                                                    className="border ml-1 text-black"
                                                    type="text"
                                                    placeholder="項目名"
                                                    value={note.name}
                                                    onChange={(e) => handleSetNoteName(i, e.target.value)}
                                                >
                                                </input>
                                                }
                                            </div>
                                            <div className="flex flex-row-reverse">
                                                <button
                                                    className="text-blue-700 ml-1"
                                                    onClick={() => handleShoppingNoteIncrementAmount(i)}
                                                >
                                                    <PlusIcon/>
                                                </button>
                                                <input
                                                    className="border text-black text-right w-1/4"
                                                    type="text"
                                                    placeholder="個数"
                                                    value={note.amount}
                                                    onChange={(e) => handleSetNoteAmount(i, Number(e.target.value))}
                                                >
                                                </input>
                                                <button
                                                    className={`${note.amount === 0 ? "text-gray-300" : "text-blue-700"} mr-1`}
                                                    onClick={() => handleShoppingNoteDecrementAmount(i)}
                                                    disabled={note.amount === 0}
                                                >
                                                    <MinusIcon/>
                                                </button>
                                            </div>
                                        </>
                                     ))}
                                     {noteTypesValidMsg !== "" && <div className="text-sm text-red-500">{noteTypesValidMsg}</div>}
                                     {noteNameValidMsg !== "" && <div className="text-sm text-red-500">{noteNameValidMsg}</div>}
                                    <div className="flex justify-center">
                                        <button
                                            className="text-blue-700 mr-4"
                                            onClick={handleAddNote}
                                        >
                                        ＋フォームを追加
                                        </button>
                                        <button
                                            className={`${notes.length === 1 ? "text-gray-300" : "text-red-700"}`}
                                            onClick={handleRemoveNote}
                                            disabled={notes.length === 1}
                                        >
                                        −フォームを削除
                                        </button>
                                    </div>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-2 rounded"
                                        onClick={handleAddItemsInventoryAmountIsZero}
                                    >
                                    在庫なしアイテムを一括で設定
                                    </button>
                                    {noZeroAmountInventoryErrMsg !== "" && <div className="text-sm text-red-500">{noZeroAmountInventoryErrMsg}</div>}
                                    <div className="text-black">登録者</div>
                                        <div className="text-3xl text-center">
                                            <input
                                                type="radio"
                                                value="1"
                                                checked={shoppingNoteCreatedBy === 1}
                                                onChange={e => handleSetShoppingNoteCreatedBy(Number(e.target.value))}
                                            />
                                            <span className="mr-8">🥺</span>
                                            <input
                                                type="radio"
                                                value="0"
                                                checked={shoppingNoteCreatedBy === 0}
                                                onChange={e => setShoppingNoteCreatedBy(Number(e.target.value))}
                                            />
                                            <span>🥺ྀི</span>
                                        </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            onClick={isUpdateShoppingNote ? handleUpdateShoppingNote : handleAddShoppingNote}
                                        >
                                            {isUpdateShoppingNote ? "変更" : "登録"}
                                        </button>
                                        <button
                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                            onClick={handleCloseShoppingNoteDialog}
                                        >
                                            キャンセル
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {handleFilterShoppingNotesWithPagination(handleDisplayShoppingNotes(shoppingNotes)).map((shoppingNote, i) => {
                        const firstShoppingNote = shoppingNote[0]
                        return (
                        <div key={i}>
                            <div className="rounded-lg overflow-hidden shadow-lg bg-white p-1 my-1">
                                <div className="bg-black text-white p-2">
                                    <div className="flex flex-col justify-left">
                                        {!firstShoppingNote.is_registered ?
                                        <div>
                                            <div className="flex justify-left space-x-1">
                                                <EditButton
                                                    onClick={() => handleOpenUpdateShoppingNoteDialog({
                                                        id: firstShoppingNote.id,
                                                        notes: JSON.stringify(shoppingNote.map((note) => ({
                                                            id: note.note_id,
                                                            types: note.note_types,
                                                            name: note.note_name,
                                                            amount: note.note_amount,
                                                            created_by: note.created_by,
                                                            version: note.note_version
                                                    }))),
                                                        is_registered: firstShoppingNote.is_registered,
                                                        created_by: firstShoppingNote.created_by,
                                                        version: firstShoppingNote.version
                                                    })}
                                                />
                                                <DeleteButton
                                                    onClick={() => deleteShoppingNote({
                                                        id: firstShoppingNote.id,
                                                        notes: JSON.stringify(shoppingNote.map((note) => ({
                                                            id: note.note_id,
                                                            types: note.note_types,
                                                            name: note.note_name,
                                                            amount: note.note_amount,
                                                            created_by: note.created_by,
                                                            version: note.note_version
                                                    }))),
                                                        is_registered: firstShoppingNote.is_registered,
                                                        created_by: firstShoppingNote.created_by,
                                                        version: firstShoppingNote.version
                                                    })}
                                                 />
                                                <div className="ml-4">登録者：{setUser(firstShoppingNote.created_by)}</div>
                                            </div>
                                            <div className="flex justify-left mt-1">
                                                <button
                                                    className={"bg-green-700 hover:bg-green-900 text-white font-blod py-1 px-1 rounded mr-1"}
                                                    onClick={() => registerToInventoryTemp({
                                                        id: firstShoppingNote.id,
                                                        notes: JSON.stringify(shoppingNote.map((note) => ({
                                                            id: note.note_id,
                                                            types: note.note_types,
                                                            name: note.note_name,
                                                            amount: note.note_amount,
                                                            created_by: note.created_by,
                                                            version: note.note_version
                                                    }))),
                                                        is_registered: firstShoppingNote.is_registered,
                                                        created_by: firstShoppingNote.created_by,
                                                        version: firstShoppingNote.version
                                                    })}
                                                >
                                                    在庫に登録
                                                </button>
                                                <button
                                                    className={"bg-gray-700 hover:bg-gray-900 text-white font-blod py-1 px-1 rounded"}
                                                    onClick={() => handleCompleteShoppingNote({
                                                        id: firstShoppingNote.id,
                                                        notes: JSON.stringify(shoppingNote.map((note) => ({
                                                            id: note.note_id,
                                                            types: note.note_types,
                                                            name: note.note_name,
                                                            amount: note.note_amount,
                                                            created_by: note.created_by,
                                                            version: note.note_version
                                                    }))),
                                                        is_registered: firstShoppingNote.is_registered,
                                                        created_by: firstShoppingNote.created_by,
                                                        version: firstShoppingNote.version
                                                    })}
                                                >
                                                    在庫登録せずに完了
                                                </button>
                                            </div>
                                        </div>
                                            :
                                        <div className="bg-green-900 flex justify-center">
                                            <CheckBadgeIcon/>
                                            <div>完了</div>
                                        </div>
                                        }
                                    </div>
                                    {shoppingNote.map((note, n) => (
                                        <div key={n} className="text-right">{`${note.note_name} x ${note.note_amount}`}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        )
                    })}
                </>
                }
                <ToasterComponent />
            </div>
        </>
    )
}

export default Inventory