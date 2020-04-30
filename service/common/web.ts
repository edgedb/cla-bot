

export class WebRequestError extends Error {}


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
