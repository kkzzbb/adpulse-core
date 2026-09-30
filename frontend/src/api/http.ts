export async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (typeof data === "object" && data !== null &&
      "error" in data && typeof data.error == "string") {
       return data.error; 
    } 
  } catch {}

  return `${fallback}: ${response.status}`;
}