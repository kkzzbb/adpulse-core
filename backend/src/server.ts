import { app } from "./app.js";

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`AdPulse API listening on http://localhost:${PORT}`);
});