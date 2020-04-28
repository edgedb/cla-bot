import { container } from "../../inversify.config"
import { TYPES } from "../../constants/types"
import { ClaRepository } from "../../service/domain/cla"
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks"

const CLA_CHECK_CONTEXT = "CLA Signing";

// TODO: create a TARGET_URL to the same environment of this API, to a method that
// displays the license
const TARGET_URL = "https://example.com/build/status";

// TODO: support configurable messages

async function checkCLA(gitHubUserId: Number): Promise<void> {
  const claRepository = container.get<ClaRepository>(TYPES.ClaRepository);
  const statusCheckService = container.get<StatusChecksService>(TYPES.StatusChecksService);

  const cla = await claRepository.getClaByGitHubUserId(gitHubUserId);

  let status: StatusCheckInput;

  if (cla == null) {
    status = new StatusCheckInput(
      CheckState.failure,
      TARGET_URL,
      "Please sign our Contributor License Agreement.",
      CLA_CHECK_CONTEXT
    );
  } else {
    status = new StatusCheckInput(
      CheckState.success,
      TARGET_URL,
      "The Contributor License Agreement is signed :heavy_check_mark:.",
      CLA_CHECK_CONTEXT
    );
  }

  await statusCheckService.createStatus(status);
}

export { checkCLA };
