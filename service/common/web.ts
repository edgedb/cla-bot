

export class WebRequestError extends Error {}


/**
 * Represents an error whose details can be safely shared with the client.
 */
export class SafeError extends Error {

  private _statusCode: number
  private _internalError?: Error

  public get statusCode(): number {
    return this._statusCode;
  }

  public get internalError(): Error | undefined {
    return this._internalError
  }

  constructor(message: string, statusCode: number = 400, internalError?: Error)
  {
    super(internalError ? `${message}. Internal error: ${internalError}` : message);
    this._statusCode = statusCode;
    this._internalError = internalError;
  }
}


export class NotFoundError extends SafeError {
  constructor(message: string = "Object not found") {
    super(message, 404)
  }
}


export class FailedHttpRequestError extends WebRequestError {
  constructor(response: Response, body: string) {
    super(`The web request response status does not indicate success: ` +
          `${response.status} ${response.statusText} \n` +
          `Body: \n${body}\n--`
    );
  }
}


export class MissingResponseBodyError extends WebRequestError {
  constructor() {
    super("Expected an HTTP response with a body, got nothing.");
  }
}


export async function expectSuccessfulResponse(response: Response) {
  if (response.status < 200 || response.status > 299) {
    throw new FailedHttpRequestError(response, await response.text());
  }
}
