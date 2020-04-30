import githubAuth from "./configuration";
import { NextApiRequest, NextApiResponse } from "next";


export default (req: NextApiRequest, res: NextApiResponse) => {
  // redirects to GitHub login page to authorize our application
  res.setHeader("Location", githubAuth.code.getUri())
  res.status(302).end()
}
