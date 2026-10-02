export class ApiError extends Error {
  public readonly status: number;
  
  constructor(message: string, status:number) {
      super(message);

      this.status = status;
      this.name = "ApiError";
  }
}

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

export async function createApiError(
  response: Response, fallback: string): Promise<ApiError> {
    const message = await readErrorMessage(response, fallback);

    return new ApiError(message, response.status);
}