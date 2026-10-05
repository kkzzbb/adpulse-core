import type { AuthUser } from "./authTypes.js";

export interface CreateAuthUserInput {
	id: string;
	email: string;
	displayName: string;
	passwordHash: string;
}

export interface LoginRecord {
	user: AuthUser;
	passwordHash: string;
}

export class EmailAlreadyExistsError extends Error {
	constructor() {
		super("Email already exists");
		this.name = "EmailAlreadyExistsError";
	}
}

export interface AuthRepository {
	createUserWithCredentials(input: CreateAuthUserInput): Promise<AuthUser>;

	findLoginRecordByEmail(email: string): Promise<LoginRecord | null>;

	findUserById(userId: string): Promise<AuthUser | null>;
}