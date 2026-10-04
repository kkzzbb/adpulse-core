CREATE TABLE user_credentials (
	user_id UUID PRIMARY KEY,
	password_hash TEXT NOT NULL
		CHECK (btrim(password_hash) <> ''),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

	CONSTRAINT user_credentials_user_id_fkey
		FOREIGN KEY (user_id)
		REFERENCES users(id)
		ON DELETE CASCADE
)