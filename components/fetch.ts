import { fetch } from "cross-fetch";


const JSON_ContentType = "application/json; charset=utf-8";


export class ApplicationError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }

  allowRetry(): boolean {
    return this.statusCode === 500;
  }
}


export class NotFoundError extends ApplicationError {
  constructor(message: string = "Object not found") {
    super(message, 404)
  }
}


async function tryParseBodyAsJSON(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");

  if (contentType !== null && contentType.indexOf("json") > -1) {
    return await response.json();
  }

  return await response.text();
}


/**
 * Wrapper around fetch API, with common logic to handle application errors
 * and response bodies.
 */
async function appFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  // TODO: handle data from server even when it includes error details
  const data = await tryParseBodyAsJSON(response)

  if (response.status === 404) {
    throw new NotFoundError();
  }

  if (response.status >= 400) {
    throw new ApplicationError(
      "Response status does not indicate success",
      response.status
    );
  }

  return data as T;
}


export async function get<T>(url: string): Promise<T>
{
  return await appFetch(url, {
    method: "GET"
  })
}


export async function post<T>(url: string, data: any): Promise<T>
{
  return await appFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": JSON_ContentType
    }
  })
}


export async function patch<T>(url: string, data: any): Promise<T>
{
  return await appFetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": JSON_ContentType
    }
  })
}


export async function _delete<T>(url: string, data: any = null): Promise<T>
{
  if (!data) {
    return await appFetch(url, {
      method: "DELETE"
    })
  }

  return await appFetch(url, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": JSON_ContentType
    }
  })
}
