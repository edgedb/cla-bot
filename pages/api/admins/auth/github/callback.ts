import githubAuth from "./configuration";
import { NextApiRequest, NextApiResponse } from "next";
import { SafeError } from "../../../../../service/common/web";


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
  // This function handles an incoming HTTP request following an attempt
  // to sign in, or a redirect fired by GitHub in case of a configuration error
  const error = readOAuthError(req);

  if (error) {
    // this is most likely a configuration error on our side
    // however, this might happen if the end user modified by hand the GitHub
    // login page url (for example, modifying the redirect_uri)
    return res.status(400).end(error);
  }

  try {
    const requestUrl = req.url

    if (!requestUrl)
      throw new Error("Missing request url.")

    const token = await githubAuth.code.getToken(requestUrl);
    const accessToken = token.accessToken;

    // TODO: verify that the user is an administrator
    // TODO: issue an access token for the user, to be used on the client,
    // redirect to admin page
    res.status(200).end(accessToken)
  } catch (error) {

    if (error instanceof SafeError) {
      res.status(error.statusCode).end(error.message);
      return;
    }

    res.status(500).end("Internal server error");
  }
}