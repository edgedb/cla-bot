import {container} from "../service/di";
import {NextApiRequest, NextApiResponse} from "next";
import {TokenExpiredError} from "jsonwebtoken";
import {TokensHandler} from "../service/handlers/tokens";
import {TYPES} from "../constants/types";

export interface AuthContext {
  user: object;
}

const tokensHandler = container.get<TokensHandler>(TYPES.TokensHandler);

function getMessageForError(error: Error): string {
  if (error instanceof TokenExpiredError) {
    return "Unauthorized: token expired";
  }

  return "Unauthorized";
}

function readJWTBearer(req: NextApiRequest): Promise<object> {
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
): Promise<object> {
  return new Promise((resolve, reject) => {
    readJWTBearer(req).then(
      (user) => {
        ((req as unknown) as AuthContext).user = user;
        resolve(user);
      },
      (error) => {
        res.status(401).end(error);
        reject(error);
      }
    );
  });
}
