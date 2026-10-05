import type { Pool } from "pg";
import type { AuthRepository, CreateAuthUserInput, LoginRecord } from "./authRepository.js";
import type { AuthUser } from "./authTypes.js";
import { EmailAlreadyExistsError } from "./authRepository.js";

interface UserRow {
	id: string;
	email: string;
	display_name: string;
}

interface LoginRow extends UserRow {
	password_hash: string;
}

function isPostgresError(error: unknown): error is {
	code?: string;
	constraint?: string;
} {
	return ( typeof error === "object" && error !== null);
}

export class PostgresAuthRepository implements AuthRepository {
	constructor(private readonly pool: Pool) {}

	async createUserWithCredentials(input: CreateAuthUserInput): Promise<AuthUser> {
		const client = await this.pool.connect();

		try {
			await client.query("BEGIN");

			const userResult = await client.query<UserRow>(
				`
				INSERT INTO users (id, email, display_name)
				VALUES ($1, $2, $3)
				RETURNING id, email, display_name
			`,
				[input.id, input.email, input.displayName]
			);

			const userRow = userResult.rows[0];

			if (!userRow) {
				throw new Error("User insert returned no rows");
			}

			await client.query(
				`
				INSERT INTO user_credentials (user_id, password_hash)
				VALUES ($1, $2)
			`,
				[input.id, input.passwordHash]
			);
			
			await client.query("COMMIT");

			return {
				id: userRow.id,
				email: userRow.email,
				displayName: userRow.display_name
			};
		} catch (error) {
			await client.query("ROLLBACK");

			if (isPostgresError(error) && error.code === "23505") {
				throw new EmailAlreadyExistsError();
			}

			throw error;
		} finally {
			client.release();
		}
	}

	async findLoginRecordByEmail(email: string): Promise<LoginRecord | null> {
		const result = await this.pool.query<LoginRow>(
			`
			SELECT u.id, u.email, u.display_name, c.password_hash
			FROM users AS u
			INNER JOIN user_credentials AS c ON c.user_id = u.id
			WHERE LOWER(u.email) = LOWER($1)
			LIMIT 1	
		`,
			[email]
		);

		const row = result.rows[0];

		if (!row) {
			return null;
		}

		return {
			user: {
				id: row.id,
				email: row.email,
				displayName: row.display_name
			},
			passwordHash: row.password_hash
		};
	}

	async findUserById(userId: string): Promise<AuthUser | null> {
		const result = await this.pool.query<UserRow>(
			`
			SELECT id, email, display_name
			FROM users
			WHERE id = $1
			LIMIT 1
		`,
			[userId]
		);

		const row = result.rows[0];
		
		if (!row) {
			return null;
		}

		return {
			id: row.id,
			email: row.email,
			displayName: row.display_name
		};
	}
}