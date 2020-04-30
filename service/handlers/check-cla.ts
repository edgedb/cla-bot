import jwt from "jsonwebtoken";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks";
import { ClaCheckInput, ClaRepository } from "../../service/domain/cla";
import { container } from "../../inversify.config";
import { getEnvSettingOrThrow } from "../../service/common/settings";
import { TYPES } from "../../constants/types";

const CLA_CHECK_CONTEXT = "CLA Signing"

const SECRET = getEnvSettingOrThrow("SECRET")
const SERVER_BASE_URL = getEnvSettingOrThrow("SERVER_URL")

// TODO: support configurable messages
const SUCCESS_MESSAGE = "The Contributor License Agreement is signed."
const FAILURE_MESSAGE = "Please sign our Contributor License Agreement."


function getTargetUrl(data: ClaCheckInput): string {
  // The target URL for the check must not only point to this instance of the web application
  // to the page that displays the license agreement,
  // it must also include a `state` query string parameter that will be handled through
  // OAuth. The state is necessary to ensure that the same person who opened the PR
  // is the one who authorizes our app and does sign-in to sign the agreement.

  // We create a JWT token, to ensure that the user cannot modify the parameter
  const token = jwt.sign({
    gitHubUserId: data.gitHubUserId,
    pullRequestHeadSha: data.pullRequestHeadSha
  }, SECRET);

  return `${SERVER_BASE_URL}/contributor-license-agreement?state=${token}`
}


async function checkCla(
  data: ClaCheckInput
): Promise<void> {
  const claRepository = container.get<ClaRepository>(TYPES.ClaRepository);
  const statusCheckService = container.get<StatusChecksService>(TYPES.StatusChecksService);

  const cla = await claRepository.getClaByGitHubUserId(data.gitHubUserId);
  const targetUrl = getTargetUrl(data);
  let status: StatusCheckInput;

  if (cla == null) {
    status = new StatusCheckInput(
      CheckState.failure,
      targetUrl,
      FAILURE_MESSAGE,
      CLA_CHECK_CONTEXT
    );

    // TODO: add also a comment to the PR,
    // to increase visibility (as in current solution?)

  } else {
    status = new StatusCheckInput(
      CheckState.success,
      targetUrl,
      SUCCESS_MESSAGE,
      CLA_CHECK_CONTEXT
    );
  }

  await statusCheckService.createStatus(
    data.repository.ownerId,
    data.repository.fullName,
    data.pullRequestHeadSha,
    status
  );
}

export { checkCla };
