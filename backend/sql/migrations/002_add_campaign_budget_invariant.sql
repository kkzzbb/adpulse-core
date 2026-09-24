ALTER TABLE campaigns
ADD CONSTRAINT campaigns_budget_covers_spent
CHECK (budget >= spent);