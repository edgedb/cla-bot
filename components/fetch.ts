import { fetch } from "cross-fetch";


const JSON_ContentType = "application/json; charset=utf-8";


export class ApplicationError extends Error {
  status: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.status = statusCode
  }

  allowRetry(): boolean {
    return this.status === 500;
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


function getAuthorizationHeader(): {[key: string]: string} {
  return {
    "Authorization": `Bearer ${sessionStorage.getItem("ACCESS_TOKEN")}`
  }
}


/**
 * Wrapper around fetch API, with common logic to handle application errors
 * and response bodies.
 */
async function appFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {

  // extend init properties with an access token
  if (init === undefined) {
    init = {
      headers: getAuthorizationHeader()
    }
  } else {
    init.headers = Object.assign({}, init.headers, getAuthorizationHeader());
  }

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


export async function post<T>(url: string, data: any = null): Promise<T>
{
  if (!data) {
    return await appFetch(url, {
      method: "POST"
    })
  }

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


export async function put<T>(url: string, data: any): Promise<T>
{
  return await appFetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": JSON_ContentType
    }
  })
}


export async function del<T>(url: string, data: any = null): Promise<T>
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
