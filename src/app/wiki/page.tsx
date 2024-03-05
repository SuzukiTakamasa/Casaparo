"use client"

import React, { useState, useEffect, useCallback} from 'react'
import { WikiData, WikiResponse } from '../utils/constants'
import APIClient from '../utils/api_client'


const client = new APIClient()


const Wiki = () => {
    const [showDialog, setShowDialog] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)

    const [wikis, setWikis] = useState<WikiResponse>([])
    const [id, setId] = useState(0)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [createdBy, setCreatedBy] = useState(0)
    const [version, setVersion] = useState(1)

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

    return (
        <h1 className="text-2xl font-bold mc-4">💥 Wiki 💥</h1>
    )
}

export default Wiki