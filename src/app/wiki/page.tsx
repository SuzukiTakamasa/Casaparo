"use client"

import React, { useState, useEffect, useCallback} from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

import { WikiData, WikiResponse } from '../utils/constants'
import { PencilIcon, TrashBoxIcon } from '../components/HeroicIcons'
import APIClient from '../utils/api_client'
import { setUser } from '../utils/utility_function'


const client = new APIClient()


const Wiki = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const [wikis, setWikis] = useState<WikiResponse>([])
    const [id, setId] = useState(0)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [createdBy, setCreatedBy] = useState(1)
    const [version, setVersion] = useState(1)

    const handleAddWiki = () => {
        addWiki()
        handleCloseDialog()
    }
    const handleUpdateWiki = () => {
        updateWiki()
        handleCloseDialog()
    }
    const handleOpenAddDialog = () => {
        setShowDialog(true)
    }
    const handleOpenUpdateDialog = ({id, title, content, created_by, version}: WikiData) => {
        setShowDialog(true)
        setId(id as number)
        setTitle(title)
        setContent(content)
        setCreatedBy(created_by)
        setVersion(version)
        setIsUpdate(true)
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setId(0)
        setTitle("")
        setContent("")
        setCreatedBy(1)
        setVersion(1)
        setIsUpdate(false)
    }
    const handleSetCreatedBy = (event: any) => {
        setCreatedBy(Number(event.target.value))
    }
    const handleShowPreview = () => {
        setShowPreview(!showPreview)
    }

    const fetchWikis = useCallback(async () => {
        try {
            const wikis = await client.get<WikiResponse>('/wiki')
            setWikis(wikis || [])
        } catch (e) {
            console.error("Failed to fetch wikis", e)
        }
    }, [])
    const addWiki = async () => {
        const addedWikiData = {
            title: title,
            content: content,
            created_by: createdBy,
            version: version
        }
        try {
            const res = await client.post<WikiResponse>('/wiki/create', addedWikiData)
            await fetchWikis()
        } catch (e) {
            console.error("Failed to add a wiki", e)
        }
    }
    const updateWiki = async () => {
        const updatedWikiData = {
            id: id,
            title: title,
            content: content,
            created_by: createdBy,
            version: version
        }
        try {
            const res = await client.post<WikiResponse>('/wiki/update', updatedWikiData)
            await fetchWikis()
        } catch (e) {
            console.error("Failed to update a wiki", e)
        }
    }
    const deleteWiki = async(deleteWikiData: WikiData) => {
        if (!window.confirm("削除しますか？")) return
        try {
            const res = await client.post<WikiResponse>('/wiki/delete', deleteWikiData)
            await fetchWikis()
        } catch (e) {
            console.error("Failed to delete a wiki", e)
        }
    }

    useEffect(() => {
        fetchWikis()
    }, [fetchWikis])

    return (
    <>
        <h1 className="text-2xl font-bold mc-4">💥 Wiki 💥</h1>

        <div className="container mx-auto p-4">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={handleOpenAddDialog}
            >
            登録
            </button>

            {showDialog && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded">
                        <div className="flex flex-col space-y-4 mb-4">
                            <input 
                                className="border p-2 text-black"
                                type="text"
                                placeholder="タイトル"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <textarea
                                className="border p-2 text-black"
                                placeholder="内容"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            >
                            </textarea>
                            <div className="text-black">作成者</div>
                            <div className="text-3xl text-center">
                                <input
                                    type="radio"
                                    value="1"
                                    checked={createdBy === 1}
                                    onChange={handleSetCreatedBy}
                                    />
                                    <span className="mr-8">🥺</span>
                                <input
                                    type="radio"
                                    value="0"
                                    checked={createdBy === 0}
                                    onChange={handleSetCreatedBy}
                                    />
                                    <span>🥺ྀི</span>
                            </div>
                            <button
                                className="aria-label text-black text-left"
                                onClick={handleShowPreview}
                            >
                                {showPreview ? "▼プレビューを非表示" : "▶︎プレビューを表示"}
                            </button>
                            {showPreview &&
                                <div className="text-black">
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                </div>
                            }
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={isUpdate ? handleUpdateWiki : handleAddWiki}
                                >
                                    {isUpdate ? "変更" : "登録"}
                                </button>
                                <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleCloseDialog}
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <table className="table-auto min-w-full mt-4">
                <thead>
                    <tr>
                        <th className="border-b-2 py-1 bg-blue-900 text-white"></th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white">タイトル</th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white">作成者</th>
                    </tr>
                </thead>
                <tbody>
                    {wikis.map((wiki, i) => (
                        <tr key={i} >
                            <td className="border-b py-1 flex-row justify-center items-center space-x-1">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-blod py-1 px-1 rounded"
                                    onClick={() => handleOpenUpdateDialog({
                                        id: wiki.id,
                                        title: wiki.title,
                                        content: wiki.content,
                                        created_by: wiki.created_by,
                                        version: wiki.version
                                    })}
                                >
                                    <PencilIcon />
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                    onClick={() => deleteWiki({
                                        id: wiki.id,
                                        title: wiki.title,
                                        content: wiki.content,
                                        created_by: wiki.created_by,
                                        version: wiki.version
                                    })}
                                >
                                    <TrashBoxIcon />
                                </button>
                            </td>
                            <td className="border-b px-1 py-1 text-center">
                                <Link href={`/wiki/detail?id=${wiki.id}`} className="text-blue-700 hover:underline">{wiki.title}</Link>
                            </td>
                            <td className="border-b px-1 py-1 text-center">{setUser(wiki.created_by)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
    )
}

export default Wiki