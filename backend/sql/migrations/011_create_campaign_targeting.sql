CREATE TABLE campaign_targeting (
  campaign_id UUID PRIMARY KEY,
  countries TEXT[] NOT NULL DEFAULT '{}',
  devices TEXT[] NOT NULL DEFAULT '{}',
  age_min SMALLINT,
  age_max SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT campaign_targeting_campaign_id_fkey
    FOREIGN KEY (campaign_id)
    REFERENCES campaigns(id)
    ON DELETE CASCADE,

  CONSTRAINT campaign_targeting_age_min_check
    CHECK (age_min IS NULL OR (age_min >= 13 AND age_min <= 100)),

  CONSTRAINT campaign_targeting_age_max_check
    CHECK (age_max IS NULL OR (age_max >= 13 AND age_max <= 100)),
  
  CONSTRAINT campaign_targeting_age_range_check
    CHECK (age_min IS NULL OR age_max IS NULL OR age_min <= age_max),

  CONSTRAINT campaign_targeting_devices_check
    CHECK (devices <@ ARRAY[
            'DESKTOP',
            'MOBILE',
            'TABLET'
          ]::TEXT[])
);