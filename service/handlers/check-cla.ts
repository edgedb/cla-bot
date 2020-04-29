import { container } from "../../inversify.config"
import { TYPES } from "../../constants/types"
import { ClaCheckInput, ClaRepository } from "../../service/domain/cla"
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks"

const CLA_CHECK_CONTEXT = "CLA Signing"

// TODO: create a TARGET_URL to the same environment of this API, to a method that
// displays the license
const TARGET_URL = "https://example.com/build/status"

// TODO: support configurable messages
const SUCCESS_MESSAGE = "The Contributor License Agreement is signed."
const FAILURE_MESSAGE = "Please sign our Contributor License Agreement."


async function checkCla(
  data: ClaCheckInput
): Promise<void> {
  const claRepository = container.get<ClaRepository>(TYPES.ClaRepository);
  const statusCheckService = container.get<StatusChecksService>(TYPES.StatusChecksService);

  const cla = await claRepository.getClaByGitHubUserId(data.gitHubUserId);

  let status: StatusCheckInput;

  // TODO: complete this part
  //  && false
  if (cla == null) {
    status = new StatusCheckInput(
      CheckState.failure,
      TARGET_URL,
      FAILURE_MESSAGE,
      CLA_CHECK_CONTEXT
    );

    // TODO: add also a comment to the PR,
    // to increase visibility (as in current solution?)

  } else {
    status = new StatusCheckInput(
      CheckState.success,
      TARGET_URL,
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
