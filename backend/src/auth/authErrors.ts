export class InvalidCredentialsError extends Error {
	constructor() {
		super("Invalid email or password");
		this.name = "InvalidCredentialsError";
	}
}

export class RegistrationConflictError extends Error {
	constructor() {
		super("Unable to create account with those details");
		this.name = "RegistrationConflictError";
	}
}