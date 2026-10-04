import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import type { Pool } from "pg";

interface SessionMiddlewareOptions {
	pool: Pool;
	secret: string;
	production: boolean;
}

export function createSessionMiddleware({
	pool, secret, production,
}: SessionMiddlewareOptions) {
	const PostgresSessionStore = connectPgSimple(session);

	return session({
		name: "adpulse.sid",
		store: new PostgresSessionStore({
			pool,
			tableName: "user_sessions",
		}),
		secret,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			sameSite: "lax",
			secure: production,
			maxAge: 7 * 24 * 60 * 60 * 1000
		}
	});
}