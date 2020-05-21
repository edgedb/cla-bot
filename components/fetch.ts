import { fetch } from "cross-fetch";


export class ApplicationError extends Error {
  constructor(message: string) {
    super(message)
  }
}


async function tryParseBodyAsJSON(response: Response): Promise<any> {
  // TODO: handle non JSON response
  return response.json();
}


/**
 * Wrapper around fetch API, with common logic to handle application errors
 * and response bodies.
 */
export default async function ifetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  const data = await tryParseBodyAsJSON(response)

  if (response.status >= 400) {
    throw new ApplicationError("Response status does not indicate success");
  }

  return data as T;
}
