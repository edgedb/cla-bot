

export class WebRequestError extends Error {}


export interface ErrorDetails {
  statusCode: number,
  error: string,
  errorCode?: string
}

/**
 * Represents an error whose details can be safely shared with the client.
 */
export class SafeError extends Error {

  private _statusCode: number
  private _errorCode?: string
  private _internalError?: Error

  public get statusCode(): number {
    return this._statusCode;
  }

  public get errorCode(): string | undefined {
    return this._errorCode;
  }

  public get internalError(): Error | undefined {
    return this._internalError
  }

  public getObject(): ErrorDetails {
    return {
      statusCode: this.statusCode,
      error: this.message,
      errorCode: this._errorCode
    }
  }

  constructor(
    message: string,
    statusCode: number = 400,
    internalError?: Error,
    errorCode?: string)
  {
    super(internalError
      ? `${message}. Internal error: ${internalError}`
      : message
    )
    this._statusCode = statusCode
    this._internalError = internalError
    this._errorCode = errorCode
  }
}


export class NotFoundError extends SafeError {
  constructor(message: string = "Object not found") {
    super(message, 404)
  }
}


export class InvalidArgumentError extends SafeError {
  constructor(
    message: string = "Invalid argument"
  ) {
    super(message, 400, undefined, "Invalid Argument")
  }
}


export class ConflictError extends SafeError {
  constructor(
    message: string = "Conflict",
    internalError?: Error
  ) {
    super(message, 409, internalError, "Conflict")
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


export async function expectSuccessfulResponse(
  response: Response
): Promise<void> {
  if (response.status < 200 || response.status > 299) {
    throw new FailedHttpRequestError(response, await response.text());
  }
}
