"use client"

import React, { useState, useEffect, useContext, useCallback } from 'react'
import APIClient from '@utils/api_client'


const client = new APIClient()


const WikiDetail = ({ params }: {params: {id: string}}) => {
    
    return (
        <>{params.id}</>
    )
}

export default WikiDetail