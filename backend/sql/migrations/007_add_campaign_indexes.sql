CREATE INDEX idx_campaigns_user_created
ON campaigns (user_id, created_at DESC);

CREATE INDEX idx_creatives_campaign_created
ON creatives (campaign_id, created_at ASC);