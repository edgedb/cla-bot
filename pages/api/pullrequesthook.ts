import { NextApiRequest, NextApiResponse } from 'next'

import { checkCLA } from "../../service/handlers/check-cla";

// Handler for GitHub pull requests.
// It verifies that the user who is creating a PR signed the CLA,
// and posts a status check to the PR.

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    method
  } = req

  if (method != 'POST') {
    return res.status(404).end("Not found");
  }

  // Next.js enforces lowercase header names
  let event = req.headers['x-github-event']

  if (!event) {
    return res.status(400).end("Missing X-GitHub-Event header");
  }

  switch (event) {
    case 'pull_request':
      const { body } = req;
      const pullRequestUserId = body?.pull_request?.user?.id;

      if (!pullRequestUserId) {
        return res.status(400).end("Expected a request body with pull request user id");
      }

      await checkCLA(pullRequestUserId)
      res.status(200).end("OK")
      break
    default:
      return res.status(400).end(`The event ${event} is not handled.`);
  }
}
