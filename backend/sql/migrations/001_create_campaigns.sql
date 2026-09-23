CREATE TABLE campaigns (
	id UUID PRIMARY KEY,

	name TEXT NOT NULL
		CHECK (btrim(name) <> ''),

	budget NUMERIC(12, 2) NOT NULL
		CHECK (budget > 0),
	
	spent NUMERIC(12, 2) NOT NULL DEFAULT 0
		CHECK (spent >= 0),
	
	status TEXT NOT NULL DEFAULT 'DRAFT'
		CHECK (
			status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED')
		),

	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);