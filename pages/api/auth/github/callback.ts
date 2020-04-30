import githubAuth from "./configuration";
import { NextApiRequest, NextApiResponse } from "next";
import { SafeError } from "../../../../service/common/web";
import { SignClaHandler } from "../../../../service/handlers/sign-cla";


const signHandler = new SignClaHandler();


function readOAuthError(req: NextApiRequest): string | null {
  const query = req.query
  const error = query.error
  const error_description = query.error_description

  if (error) {
    return `OAuth integration error: ${error}; description: ${error_description}`
  }
  return null;
}


export default async (req: NextApiRequest, res: NextApiResponse) => {
  // This function handles an incoming HTTP request following an attempt to sign in,
  // or a redirect fired by GitHub in case of a configuration error
  const error = readOAuthError(req);

  if (error) {
    // this is most likely a configuration error on our side
    // however, this might happen if the end user modified by hand the GitHub
    // login page url (for example, modifying the redirect_uri)
    return res.status(400).end(error);
  }

  const rawState = req.query.state;

  if (!rawState) {
    return res.status(400).end(
      "Missing state context: expected information about original PR and the user " +
      "who created it."
    );
  }

  try {
    const requestUrl = req.url

    if (!requestUrl)
      throw new Error("Missing request url.")

    const token = await githubAuth.code.getToken(requestUrl);
    const accessToken = token.accessToken;

    await signHandler.signCla(rawState.toString(), accessToken);

    res.status(200).end("OK");
  } catch (error) {

    if (error instanceof SafeError) {
      res.status(error.statusCode).end(error.message);
      return;
    }

    console.error(error);
    res.status(500).end("Internal server error");
  }
}
