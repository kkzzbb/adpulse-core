CREATE UNIQUE INDEX idex_users_email_lower_unique
ON users (LOWER(email));