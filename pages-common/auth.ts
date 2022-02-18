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

export function readJWTBearer(req: NextApiRequest): Promise<object> {
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
      return reject(getMessageForError(error as Error));
    }

    resolve(identity);
  });
}
