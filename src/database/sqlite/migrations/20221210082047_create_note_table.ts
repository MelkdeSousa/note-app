import { Migration } from '../client'

export const createNoteTable: Migration = async (db): Promise<void> => {
	db.transaction(tx => {
		tx.executeSql(
			'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, created_at DATETIME, updated_at DATETIME);'
		)
	})
}
