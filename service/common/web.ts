export interface ErrorDetails {
  statusCode: number;
  error: string;
  errorCode?: string;
}

/**
 * Represents an error whose details can be safely shared with the client.
 * In this context, it can be seen as the base class for errors related to
 * incoming web requests. That is, errors we throw intentionally to provide
 * useful information to our clients.
 */
export class SafeError extends Error {
  private _statusCode: number;
  private _errorCode?: string;
  private _internalError?: Error;

  public get statusCode(): number {
    return this._statusCode;
  }

  public get errorCode(): string | undefined {
    return this._errorCode;
  }

  public get internalError(): Error | undefined {
    return this._internalError;
  }

  public getObject(): ErrorDetails {
    return {
      statusCode: this.statusCode,
      error: this.message,
      errorCode: this._errorCode,
    };
  }

  constructor(
    message: string,
    statusCode: number = 400,
    internalError?: Error,
    errorCode?: string
  ) {
    super(
      internalError ? `${message}. Internal error: ${internalError}` : message
    );
    this._statusCode = statusCode;
    this._internalError = internalError;
    this._errorCode = errorCode;
  }
}

export class NotFoundError extends SafeError {
  constructor(message: string = "Object not found") {
    super(message, 404);
  }
}

export class InvalidOperationError extends SafeError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InvalidArgumentError extends SafeError {
  constructor(message: string = "Invalid argument") {
    super(message, 400, undefined, "Invalid Argument");
  }
}

export class BadRequestError extends SafeError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends SafeError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ConflictError extends SafeError {
  constructor(message: string = "Conflict", internalError?: Error) {
    super(message, 409, internalError, "Conflict");
  }
}

/**
 * Base class for outgoing web requests errors.
 * That is, errors we throw when we do a web request and it fails.
 */
export class WebRequestError extends Error {}

export class FailedHttpRequestError extends WebRequestError {
  constructor(response: Response, body: string) {
    super(
      `The web request response status does not indicate success: ` +
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
    if (response.status === 404) {
      throw new NotFoundError();
    }

    throw new FailedHttpRequestError(response, await response.text());
  }
}
