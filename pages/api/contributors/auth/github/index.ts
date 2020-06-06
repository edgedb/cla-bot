import githubAuth from "./configuration";
import {NextApiRequest, NextApiResponse} from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  // redirects to GitHub login page to authorize our application
  const state = req.query.state;

  if (!state) {
    // A state context is required to recreate the PR and original poster ID
    return res.status(400).end("Missing state context.");
  }

  const signInUrl = githubAuth.code.getUri();

  if (signInUrl.endsWith("&state=") === false) {
    // Something changed in the library used for OAuth
    throw new Error(`Breaking change in the library used for OAuth.
      Expected a url ending with "state=". Verify what is the actual value: we need
      to pass a query string parameter inside the redirect location.
    `);
  }

  res.setHeader("Location", signInUrl + state);
  res.status(302).end();
};
