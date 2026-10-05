export interface AuthUser {
	id: string;
	email: string;
	displayName: string;
}

export interface RegisterInput {
	email: string;
	displayName: string;
	password: string;
}

export interface LoginInput {
	email: string;
	password: string;
}