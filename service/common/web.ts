

export class WebRequestError extends Error {}


export class SafeError extends Error {
  // Represents an error that can be safely shared with the client

  private _statusCode: number

  public get statusCode(): number {
    return this._statusCode;
  }

  constructor(message: string, statusCode: number = 400)
  {
    super(message);
    this._statusCode = statusCode;
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
