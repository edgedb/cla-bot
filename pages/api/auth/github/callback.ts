import githubAuth from "./configuration";
import { NextApiRequest, NextApiResponse } from "next";


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
  // this function handles an incoming HTTP request following an attempt to sign in
  const error = readOAuthError(req);

  if (error) {
    // this is most likely a configuration error on our side
    // however, this might happen if the end user modified by hand the GitHub
    // login page url (for example, modifying the redirect_uri)
    return res.status(400).end(error);
  }

  const rawState = req.query.state;

  if (!rawState) {
    // in this context, we expect a state containing a
    // base64 encoded JSON structure with PR id and user id
    return res.status(400).end(
      "Missing state context: expected information about original PR and the user who created it."
    );
  }

  // in this context, we expect
  console.info(req.query)
  console.info(req.headers)

  try {
    const requestUrl = req.url

    if (!requestUrl)
      throw new Error("Missing request url.")

    const token = await githubAuth.code.getToken(requestUrl);
    const accessToken = token.accessToken;

    // TODO: get user information using the access token
    // curl -H "Authorization: token 71c51786930fbfeabc1812944052a1d6d3ba9182" https://api.github.com/user
    // validate that the user who just signed in, is the same who created the PR.

    // User authentication is something that belongs to the front-end,
    // so we get user ID here, and pass it to the business logic.

    console.info(token);
    res.status(200).end("OK");
  } catch (error) {

    console.error(error);
    res.status(500).end("Internal server error");
  }
}
