"use client"

//export const runtime = 'edge'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import dynamic from 'next/dynamic'

import { WikiData, WikiResponse } from '@utils/interfaces'
import { TrashBoxIcon } from '@components/Heroicons'
import { EditButton, DeleteButton } from '@components/Buttons'
import { ToasterComponent, APIResponseToast } from '@components/ToastMessage'
import ValidationErrorMessage from '@components/ValidationErrorMessage'
import Loader from '@components/Loader'
import { PageTitle } from '@components/Title'
import { HorizontallyScrollableTable } from '@components/HorizontallyScrollableTable'
import { CreatedBy } from '@utils/constants'

import { APIClient, R2Client } from '@utils/api_client'
import { setCreatedByStr, getCurrentDateTime } from '@utils/utility_function'
import { ReactQuillStyles } from '@utils/styles'


const ReactQuill = dynamic(() => import('react-quill'))

const client = new APIClient()
const r2Client = new R2Client()


const Wiki = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [titleValidMsg, setTitleValidMsg] = useState("")
    const [contentValidMsg, setContentValidMsg] = useState("")

    const [imageFetchErrTxt, setImageFetchErrTxt] = useState("")

    const [wikis, setWikis] = useState<WikiResponse>([])
    const [id, setId] = useState(0)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [createdBy, setCreatedBy] = useState(1)
    const [imageUrl, setImageUrl] = useState("")
    const [version, setVersion] = useState(1)

    const [isBlocking, setIsBlocking] = useState(false)

    const validate = () => {
        let isValid = true
        if (title === "") {
            isValid = false
            setTitleValidMsg("タイトルを入力してください。")
        }
        if (content === "") {
            isValid = false
            setContentValidMsg("内容を入力してください。")
        }
        return isValid
    }
    const handleSetContent = (value: string) => {
        setContent(value)
    }

    const handleAddWiki = async () => {
        if (!validate()) return
        setIsBlocking(true)
        const response = await addWiki()
        setIsBlocking(false)
        handleCloseDialog()
        APIResponseToast(response, "Wikiを登録しました。", "Wikiの登録に失敗しました。")
    }
    const handleUpdateWiki = async () => {
        if (!validate()) return
        setIsBlocking(true)
        const response = await updateWiki()
        setIsBlocking(false)
        handleCloseDialog()
        APIResponseToast(response, "Wikiを更新しました。", "Wikiの更新に失敗しました。")
    }
    const handleOpenAddDialog = () => {
        setShowDialog(true)
    }
    const handleOpenUpdateDialog = ({id, title, content, created_by, image_url, version}: WikiData) => {
        setShowDialog(true)
        setId(id as number)
        setTitle(title)
        setContent(content)
        setCreatedBy(created_by)
        setImageUrl(image_url)
        setVersion(version)
        setIsUpdate(true)
    }
    const handleCloseDialog = () => {
        setShowDialog(false)
        setId(0)
        setTitle("")
        setContent("")
        setCreatedBy(CreatedBy.T)
        setImageUrl("")
        setVersion(1)
        setIsUpdate(false)
        setTitleValidMsg("")
        setContentValidMsg("")
        setImageFetchErrTxt("")
    }
    const handleShowPreview = () => {
        setShowPreview(!showPreview)
    }
    const fetchWikis = useCallback(async () => {
        const wikis = await client.get<WikiResponse>('/v2/wiki')
        setWikis(wikis.data || [])
    }, [])
    const addWiki = async () => {
        const addedWikiData = {
            title: title,
            content: content,
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            image_url: imageUrl,
            version: version
        }
        const response = await client.post<WikiData>('/v2/wiki/create', addedWikiData)
        await fetchWikis()
        return response
    }
    const updateWiki = async () => {
        const updatedWikiData = {
            id: id,
            title: title,
            content: content,
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            image_url: imageUrl,
            version: version
        }
        const response = await client.post<WikiData>('/v2/wiki/update', updatedWikiData)
        await fetchWikis()
        return response
    }
    const updateImageUrlEmpty = async () => {
        const updatedWikiData = {
            id: id,
            title: title,
            content: content,
            created_by: createdBy,
            updated_at: getCurrentDateTime(),
            image_url: "",
            version: version
        }
        const response = await client.post<WikiData>('/v2/wiki/update', updatedWikiData)
        APIResponseToast(response, "Wikiを更新しました。", "Wikiの更新に失敗しました。")
        await fetchWikis()
    }
    const deleteWiki = async(deleteWikiData: WikiData) => {
        if (!window.confirm("削除しますか？")) return
        const response = await client.post<WikiData>('/v2/wiki/delete', deleteWikiData)
        if (response.data && deleteWikiData.image_url !== "") {
            const fileName = getImageFileName(deleteWikiData.image_url)
            await r2Client.delete(fileName)
        }
        APIResponseToast(response, "Wikiを削除しました。", "Wikiの削除に失敗しました。")
        await fetchWikis()
    }

    const getImageFileName = (imageUrl: string) => {
        return new URL(imageUrl).pathname.slice(1)
    }
    const handleUploadFile = async(event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files![0]
        const response = await r2Client.upload(file)
        if (response.hasOwnProperty("image_url")) {
            setImageUrl(response.image_url)
        } else {
            setImageFetchErrTxt("画像のアップロードに失敗しました。")
        }
    }
    const handleDeleteFile = async(fileName: string) => {
        if (!window.confirm("削除しますか？")) return
        const response = await r2Client.delete(fileName)
        if (response.hasOwnProperty("image_url")) {
            setImageUrl("")
            if (isUpdate) {
                await updateImageUrlEmpty()
            }
        } else {
            setImageFetchErrTxt("画像の削除に失敗しました。")
        }
    }

    useEffect(() => {
        fetchWikis()
    }, [fetchWikis])

    return (
    <>
        <PageTitle title={"💥 Wiki 💥"} />

        <div className="container mx-auto p-4">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={handleOpenAddDialog}
            >
            登録
            </button>

            {showDialog && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
                    <div className="bg-white p-4 rounded">
                        <div className="flex flex-col space-y-4 mb-4">
                            <input 
                                className="border p-2 text-black"
                                type="text"
                                placeholder="タイトル"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            <ValidationErrorMessage message={titleValidMsg} />
                            <ReactQuill
                                className="text-black"
                                value={content}
                                onChange={handleSetContent}
                                modules={ReactQuillStyles.modules}
                                formats={ReactQuillStyles.formats}
                            />
                            <ValidationErrorMessage message={contentValidMsg} />
                            <div className="text-black">作成者</div>
                            <div className="text-3xl text-center">
                                <input
                                    type="radio"
                                    value="1"
                                    checked={createdBy === 1}
                                    onChange={e => setCreatedBy(Number(e.target.value))}
                                    />
                                    <span className="mr-8">🥺</span>
                                <input
                                    type="radio"
                                    value="0"
                                    checked={createdBy === 0}
                                    onChange={e => setCreatedBy(Number(e.target.value))}
                                    />
                                    <span>🥺ྀི</span>
                            </div>
                            <div className="flex justify-center">
                                <input className="block" type="file" onChange={handleUploadFile} />
                            </div>
                            {imageUrl &&
                            <div className='flex justify-center'>
                                <div className="text-black font-bold">{getImageFileName(imageUrl)}</div>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded ml-2"
                                    onClick={() => handleDeleteFile(getImageFileName(imageUrl))}
                                >
                                    <TrashBoxIcon />
                                </button>
                            </div>
                            }
                            <ValidationErrorMessage message={imageFetchErrTxt} />
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
                            <div className="flex justify-center space-x-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={isUpdate ? handleUpdateWiki : handleAddWiki}
                                >
                                    {isBlocking ? <Loader size={20} isLoading={isBlocking} /> : isUpdate ? "変更" : "登録"}
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

            <HorizontallyScrollableTable>
                <thead>
                    <tr>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap"></th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap">タイトル</th>
                        <th className="border-b-2 py-1 bg-blue-900 text-white text-sm whitespace-nowrap">作成者</th>
                    </tr>
                </thead>
                <tbody>
                    {wikis.map((wiki, i) => (
                        <tr key={i} >
                            <td className="border-b py-1 flex-row justify-center items-center space-x-1 whitespace-nowrap">
                                <EditButton
                                    onClick={() => handleOpenUpdateDialog({
                                        id: wiki.id,
                                        title: wiki.title,
                                        content: wiki.content,
                                        created_by: wiki.created_by,
                                        updated_at: wiki.updated_at,
                                        image_url: wiki.image_url,
                                        version: wiki.version
                                    })}
                                />
                                <DeleteButton
                                    onClick={() => deleteWiki({
                                        id: wiki.id,
                                        title: wiki.title,
                                        content: wiki.content,
                                        created_by: wiki.created_by,
                                        updated_at: wiki.updated_at,
                                        image_url: wiki.image_url,
                                        version: wiki.version
                                    })}
                                />
                            </td>
                            <td className="border-b px-1 py-1 text-center text-sm whitespace-nowrap">
                                <Link href={`/wiki/detail?id=${wiki.id}`} className="text-blue-500 font-bold hover:underline">{wiki.title}</Link>
                                <div className="text-xs">{`(最終更新: ${wiki.updated_at})`}</div>
                            </td>
                            <td className="border-b px-1 py-1 text-center text-sm whitespace-nowrap">{setCreatedByStr(wiki.created_by)}</td>
                        </tr>
                    ))}
                </tbody>
            </HorizontallyScrollableTable>
        </div>
        <ToasterComponent />
    </>
    )
}

export default Wiki