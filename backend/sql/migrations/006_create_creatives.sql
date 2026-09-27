CREATE TABLE creatives (
	id UUID PRIMARY KEY,

	campaign_id UUID NOT NULL,

	headline TEXT NOT NULL
		CHECK (btrim(headline) <> ''),

	body TEXT NOT NULL
		CHECK (btrim(body) <> ''),

	destination_url TEXT NOT NULL
		CHECK (btrim(destination_url) <> ''),

	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT creatives_campaign_id_fkey
		FOREIGN KEY (campaign_id)
		REFERENCES campaigns(id)
		ON DELETE RESTRICT
)