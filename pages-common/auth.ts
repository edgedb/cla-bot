import { container } from "../service/di";
import { NextApiResponse, NextApiRequest } from "next";
import { TokensHandler } from "../service/handlers/tokens";
import { TYPES } from "../constants/types";
import { TokenExpiredError } from "jsonwebtoken";
import { IncomingMessage, ServerResponse } from "http";


export interface AuthContext {
  user: object
}


const tokensHandler = container
  .get<TokensHandler>(TYPES.TokensHandler);


function getMessageForError(error: Error): string {
  if (error instanceof TokenExpiredError) {
    return "Unauthorized: token expired";
  }

  return "Unauthorized";
}


function readJWTBearer(
  req: IncomingMessage
): Promise<object> {
  return new Promise((resolve, reject) => {
    const authorization = req.headers.authorization;

    // Expect a single authorization header
    if (typeof authorization !== "string") {
      return reject("Unauthorized");
    }

    const [type, value] = authorization.split(/\s/);

    // Support only JWT Bearer authorization
    if (!/^bearer$/i.test(type)) {
      return reject("Unauthorized");
    }

    let identity: object;

    try {
      identity = tokensHandler.verifyToken(value);
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.log(`JWT validation failure: ${error}`);
      return reject(getMessageForError(error));
    }

    resolve(identity);
  });
}


// NB: the function below is coded like in the official documentation
// middlewares example (2020.06.04).
// This is convenient because some admin api routes can still be public:
// for example those that return the list of agreements (GET),
// even though cherry-picking endpoints that require authentication is
// not the best developer's UX.

/**
 * Requires an authenticated user for an API request. Inspects request headers
 * to look for a valid JWT Bearer token. Stops request handling and returns
 * 401 for unauthorized users.
 */
export function auth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  return new Promise((resolve, reject) => {
    readJWTBearer(req).then(user => {
      (req as unknown as AuthContext).user = user;
      resolve();
    }, error => {
      res.status(401).end(error);
      reject(error);
    });
  });
}


/**
 * Requires an authenticated user for a page request. Inspects request headers
 * to look for a valid JWT Bearer token. Stops request handling and returns
 * 401 for unauthorized users.
 *
 * With this approach, authentication check happens before rendering the page,
 * and the page is a serverless function,
 * which is more expensive and slower than a static page with checks done on
 * the client side.
 */
export function page_auth(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  return new Promise((resolve, reject) => {
    readJWTBearer(req).then(user => {
      (req as unknown as AuthContext).user = user;
      resolve();
    }, () => {
      // redirect to the login page
      res.writeHead(302, {
        Location: `/admin/login`,
      });
      res.end();
      reject();
    });
  });
}

// The function above can be used to require authentication in ADMIN pages,
// in `getServerSideProps` functions, following the example from:
// tslint:disable-next-line: max-line-length
// https://github.com/vercel/next.js/blob/canary/examples/auth0/pages/advanced/ssr-profile.js
//
// See also:
// https://github.com/vercel/next.js/issues/153
// https://github.com/vercel/next.js/issues/153#issuecomment-473658540
