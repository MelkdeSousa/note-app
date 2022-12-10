import { SQLiteClient } from './client'
import { migrations } from './migrations'

const DB_NAME = 'note-app.db'

export const clientSqlite = new SQLiteClient(DB_NAME, migrations)

export const connectionSqlite = async (): Promise<void> => {
	await clientSqlite.connect()
}
