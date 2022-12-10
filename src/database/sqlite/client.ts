import type { ResultSet } from 'expo-sqlite'
import * as SQLite from 'expo-sqlite'

export type Migration = (db: SQLite.WebSQLDatabase) => Promise<void>

export class DowngradeError extends Error {
	constructor() {
		super()
		this.name = 'DowngradeError'
	}
}

export class SQLiteClient {
	private privateConnected = false

	private name: string

	private migrations: Migration[]

	private privateDb: SQLite.WebSQLDatabase | null = null

	constructor(name: string, migrations: Migration[]) {
		this.name = name
		this.migrations = migrations
	}

	public get connected(): boolean {
		return this.privateConnected
	}

	public get database(): SQLite.WebSQLDatabase | null {
		return this.privateDb
	}

	public async connect(): Promise<void> {
		if (this.privateConnected) {
			return
		}

		try {
			this.privateDb = SQLite.openDatabase(this.name)

			this.privateDb.exec(
				[{ sql: 'PRAGMA user_version;', args: [] }],
				false,
				async (err, [resultSet]) => {
					if (err || !resultSet['rows']) {
						throw err
					}

					const { rows } = resultSet as ResultSet

					const version = rows[0].user_version

					const nextVersion = this.migrations.length

					if (version > nextVersion) {
						throw new DowngradeError()
					}

					for await (const migration of this.migrations) {
						await migration(this.privateDb)
					}

					if (version !== nextVersion) {
						this.privateDb.exec(
							[{ sql: 'PRAGMA user_version;', args: [] }],
							false,
							err => {
								this.privateConnected = true
							}
						)
					}
				}
			)
		} catch (err) {
			if (err instanceof DowngradeError) {
				throw err
			}
			throw new Error(
				`SQLiteClient: failed to connect to database: ${this.name}`
			)
		}
	}
}
