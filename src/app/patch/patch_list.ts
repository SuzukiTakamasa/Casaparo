import { WikiData, WikiResponse, TaskData, TaskResponse } from '@utils/interfaces'
import { Patches } from '@utils/interfaces'
import { APIClient } from '@utils/api_client'
const client  = new APIClient()


const patchList: Patches<any>[] = [
    {
        id: 1,
        description: "Decode descriptions of wiki",
        function: async () => {
            const response = await client.get<WikiResponse>("/v2/wiki")
            if (response.error)  return { data: null, error: response.error }
            if (!response.data) return { data: null, error: "No data found" }
            const wikis = response.data!
            for (const wiki of wikis) {
                wiki.content = decodeURI(wiki.content)
            }
            const result = await Promise.all(wikis?.map(async (data) => {
                return client.post<WikiData>("/v2/wiki/update", data)
            }))
            if (result.every(res => res.error === null)) {
                return { data: result, error: null}
            }
        }
    },
    {
        id: 2,
        description: "Decode descriptions of task",
        function: async () => {
            const response = await client.get<TaskResponse>("/v2/wiki")
            if (response.error)  return { data: null, error: response.error }
            if (!response.data) return { data: null, error: "No data found" }
            const tasks = response.data!
            for (const task of tasks) {
                task.description = decodeURI(task.description)
            }
            const result = await Promise.all(tasks?.map(async (data) => {
                return client.post<TaskData>("/v2/task/update", data)
            }))
            if (result.every(res => res.error === null)) {
                return { data: result, error: null}
            }
        }
    }
]

export default patchList