import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth/authService.js";
import type { AuthRepository, LoginRecord } from "../auth/authRepository.js";
import type { PasswordHasher } from "../auth/passwordHasher.js";
import type { AuthUser } from "../auth/authTypes.js";

const userId = "11111111-1111-4111-8111-111111111111";

function createAuthUser(): AuthUser {
  return {
    id: userId,
    email: "alice@example.com",
    displayName: "Alice"
  };
}

function createLoginRecord(passwordHash = "this is test password"): LoginRecord {
  return {
    user: createAuthUser(),
    passwordHash
  };
}

function createAuthRepositoryMock(): AuthRepository {
  return {
    createUserWithCredentials: vi.fn(),

    findLoginRecordByEmail: vi.fn(),

    findUserById: vi.fn()
  };
}

function createPasswordHasherMock(): PasswordHasher {
  return {
    hash: vi.fn(),

    verify: vi.fn(),
  };
}

describe("AuthService", () => {
	let authRepository: AuthRepository;

	let passwordHasher: PasswordHasher;

	let service: AuthService;

	beforeEach(() => {
		authRepository = createAuthRepositoryMock();

		passwordHasher = createPasswordHasherMock();

		service = new AuthService(
				authRepository,
				passwordHasher
			);
	});

	it("rejects an incorrect password with a generic error",
		async () => {
			vi.mocked(authRepository.findLoginRecordByEmail)
				.mockResolvedValue(createLoginRecord());

			vi.mocked(passwordHasher.verify)
				.mockResolvedValue(false);

			await expect(service.login(
					{
						email: "alice@example.com",
						password: "wrong-password",
					}
				)).rejects.toThrow("Invalid email or password"); 
		},
	);

	it("does not reveal whether an email exists",
		async () => {
			vi.mocked(authRepository.findLoginRecordByEmail)
				.mockResolvedValue(null);

			await expect(service.login(
					{
						email: "unknown@example.com",
						password: "anything",
					}
				)).rejects.toThrow("Invalid email or password");
		},
	);

	it("hashes the password and saves the user during registration",
		async () => {
			vi.mocked(passwordHasher.hash)
				.mockResolvedValue("TEST_HASH_NOT_PLAINTEXT");

			vi.mocked(authRepository.createUserWithCredentials).
				mockResolvedValue(createAuthUser());

			const result = await service.register(
					{
						email: "alice@example.com",
						displayName: "Alice",
						password: "StrongPassword123!",
					}
				);

			expect(result.email).toBe("alice@example.com");

			expect(passwordHasher.hash).toHaveBeenCalledWith(
				"StrongPassword123!"
			);

			expect(authRepository.createUserWithCredentials).toHaveBeenCalledWith(
				expect.objectContaining({
					email: "alice@example.com",
					displayName: "Alice",
          passwordHash: "TEST_HASH_NOT_PLAINTEXT"
        }),
      );
    });
  },
);