"use client"

import React, { useState, useEffect, useCallback} from 'react'
import ReactMarkdown from 'react-markdown'

import { WikiData, WikiResponse } from '../utils/constants'
import APIClient from '../utils/api_client'


const client = new APIClient()


const Wiki = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const [wikis, setWikis] = useState<WikiResponse>([])
    const [id, setId] = useState(0)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [createdBy, setCreatedBy] = useState(0)
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
        setCreatedBy(0)
        setVersion(1)
        setIsUpdate(false)
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
        </div>
    </>
    )
}

export default Wiki