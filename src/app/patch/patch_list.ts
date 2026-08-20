import { Patches, ShiftMigrationData, ShiftResponse } from '@utils/interfaces'
import { APIClient } from '@utils/api_client'
const client  = new APIClient()


const patchList: Patches<any>[] = [
    {
        id: 1,
        description: "Rebuild the shifts table so that working_hour_from/to are declared as REAL",
        // SQLite cannot change a column type in place, so the rows are fetched first,
        // the table is recreated by the API, and the fetched rows are re-inserted with
        // their original ids. The API keeps the old table as `shifts_old` until every
        // row has been restored, so a failed insert never loses the data.
        function: async () => {
            const response = await client.get<ShiftResponse>("/v2/shift")
            if (response.error) return { data: null, error: response.error }
            if (!response.data) return { data: null, error: "No data found" }
            const shifts = response.data

            const migration = await client.post<ShiftMigrationData>("/v2/shift/migrate_schema", { shifts: shifts })
            if (migration.error) return { data: null, error: migration.error }

            const restored = await client.get<ShiftResponse>("/v2/shift")
            if (restored.error) return { data: null, error: restored.error }
            if (restored.data?.length !== shifts.length) {
                return { data: null, error: `Restored ${restored.data?.length ?? 0} shifts but expected ${shifts.length}` }
            }
            return { data: restored.data, error: null }
        }
    }
]

export default patchList
