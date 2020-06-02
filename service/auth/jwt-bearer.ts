import { container } from "../di";
import { NextApiResponse, NextApiRequest } from "next";
import { TokensHandler } from "../handlers/tokens";
import { TYPES } from "../../constants/types";
import { AuthContext } from "./context";
import { TokenExpiredError } from "jsonwebtoken";


const tokensHandler = container
  .get<TokensHandler>(TYPES.TokensHandler);


function getMessageForError(error: Error): string {
  if (error instanceof TokenExpiredError) {
    return "Unauthorized: token expired";
  }

  return "Unauthorized";
}


export default function auth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  return new Promise((resolve, reject) => {
    const authorization = req.headers.authorization;

    // Expect a single authorization header
    if (typeof authorization !== "string") {
      res.status(401).end("Unauthorized");
      return reject();
    }

    const [type, value] = authorization.split(/\s/);

    // Support only JWT Bearer authorization
    if (!/^bearer$/i.test(type)) {
      res.status(401).end("Unauthorized");
      return reject();
    }

    let identity: object;

    try {
      identity = tokensHandler.verifyToken(value);
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.log(`JWT validation failure: ${error}`);

      res.status(401).end(getMessageForError(error));
      return reject();
    }

    (req as unknown as AuthContext).user = identity;

    resolve();
  })
}
