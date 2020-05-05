import { ClaCheckHandler } from "../../service/handlers/check-cla";
import { ClaCheckInput } from "../../service/domain/cla";
import { container } from "../../inversify.config";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../constants/types";


// Handler for GitHub pull requests.
// It verifies that the user who is creating a PR signed the CLA,
// and posts a status check to the PR.
const handler = container.get<ClaCheckHandler>(TYPES.ClaCheckHandler);


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
    case "ping":
      // sent when configuring a webhook
      res.status(200).end("Hi there!");
      break
    case "pull_request":
      const { body } = req;

      const action = body.action;
      if (
        action != "opened" &&
        action != "reopened"
      ) {
        // do nothing; we check CLA only when
        // a PR is opened or reopened
        res.status(200).end(`Doing nothing: the pull_request action is ${action}`);
        break
      }

      const gitHubUserId = body?.pull_request?.user?.id;
      const pullRequestId = body?.pull_request?.id;
      const pullRequestNumber = body?.pull_request?.number;
      const pullRequestHeadSha = body?.pull_request?.head?.sha;
      const pullRequestUrl = body?.pull_request?.html_url;
      const targetRepositoryId = body?.repository?.id;
      const targetRepositoryOwnerId = body?.repository?.owner?.id;
      const targetRepositoryOwnerName = body?.repository?.owner?.login;
      const targetRepositoryFullName = body?.repository?.full_name;
      const targetRepositoryName = body?.repository?.name;

      if (
        !gitHubUserId ||
        !pullRequestId ||
        !pullRequestNumber ||
        !pullRequestHeadSha ||
        !pullRequestUrl ||
        !targetRepositoryId ||
        !targetRepositoryOwnerId ||
        !targetRepositoryOwnerName ||
        !targetRepositoryFullName ||
        !targetRepositoryName
      ) {
        return res.status(400).end(`Expected a pull request webhook payload with:
          pull_request.number;
          pull_request.user.id;
          pull_request.url;
          pull_request.head.sha;
          repository.id;
          repository.owner.id;
          repository.owner.login;
          repository.full_name;
          repository.name;
        `);
      }

      const input: ClaCheckInput = {
        gitHubUserId,
        committers: null,
        pullRequest: {
          id: pullRequestId,
          number: pullRequestNumber,
          url: pullRequestUrl,
          headSha: pullRequestHeadSha
        },
        repository: {
          id: targetRepositoryId,
          owner: targetRepositoryOwnerName,
          ownerId: targetRepositoryOwnerId,
          name: targetRepositoryName,
          fullName: targetRepositoryFullName
        }
      }

      await handler.checkCla(input)
      res.status(200).end("OK")

      console.log(`Handled hook for PR on ${targetRepositoryFullName}`);
      break
    default:
      return res.status(400).end(`The event ${event} is not handled.`);
  }
}
