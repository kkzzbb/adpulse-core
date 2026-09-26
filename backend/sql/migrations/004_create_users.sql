CREATE TABLE users (
	id UUID PRIMARY KEY,

	email TEXT NOT NULL UNIQUE,
		CHECK (btrim(email) <> ''),
	
	display_name TEXT NOT NULL,
		CHECK (btrim(display_name) <> ''),
	
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (id, email, display_name)
VALUES (
	'00000000-0000-4000-8000-000000000001',
  'dev@adpulse.local',
  'AdPulse Dev User'
);