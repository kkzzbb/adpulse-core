import { randomUUID } from "node:crypto";
import type { AuthRepository } from "./authRepository.js";
import { EmailAlreadyExistsError } from "./authRepository.js";
import { InvalidCredentialsError, RegistrationConflictError } from "./authErrors.js";
import type { LoginInput, RegisterInput, AuthUser } from "./authTypes.js";
import type { PasswordHasher } from "./passwordHasher.js";

export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly passwordHasher: PasswordHasher
	) {}

	async register(input: RegisterInput): Promise<AuthUser> {
		const email = input.email.trim().toLowerCase();
		const displayName = input.displayName.trim();
		const passwordHash = await this.passwordHasher.hash(input.password);

		try {
			return await this.authRepository.createUserWithCredentials({
				id: randomUUID(),
				email,
				displayName,
				passwordHash
			});
		} catch (error) {
			if (error instanceof EmailAlreadyExistsError) {
				throw new RegistrationConflictError();
			}
			throw error;
		}
	}

	async login(input: LoginInput): Promise<AuthUser> {
		const email = input.email.trim().toLowerCase();
		const record = await this.authRepository.findLoginRecordByEmail(email);

		if (!record) {
			throw new InvalidCredentialsError();
		}

		const validPassword = await this.passwordHasher.verify(record.passwordHash, input.password);

		if (!validPassword) {
			throw new InvalidCredentialsError();
		}
		
		return record.user;
	}

	async getCurrentUser(userId: string): Promise<AuthUser | null> {
		return this.authRepository.findUserById(userId);
	}
}
