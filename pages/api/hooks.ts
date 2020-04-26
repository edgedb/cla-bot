import { NextApiRequest, NextApiResponse } from 'next'

import validate from "../../service/handlers/cla/validate";

// This file defines a webhook handler for GitHub pull requests.
//

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    method
  } = req

  if (method != 'POST') {
    return res.status(404).end("Not found");
  }

  // NB: Next.js only handles lowercase headers
  let event = req.headers['x-github-event']

  if (!event) {
    return res.status(400).end("Missing X-GitHub-Event header");
  }

  switch (event) {
    case 'pull_request':
      // TODO: read the user from body.pull_request.user.id
      const { body } = req;
      const pullRequestUserId = body?.pull_request?.user?.id;

      if (!pullRequestUserId) {
        return res.status(400).end("Expected a request body with pull request user id");
      }

      await validate(pullRequestUserId)

      res.status(200).json(body)
      break
    default:
      return res.status(400).end(`The event ${event} is not handled.`);
  }
}
