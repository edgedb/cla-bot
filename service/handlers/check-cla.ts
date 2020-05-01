import jwt from "jsonwebtoken";
import { aretry } from "../common/resiliency";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks";
import { ClaCheckInput, ClaRepository } from "../../service/domain/cla";
import { inject, injectable } from "inversify";
import { ServiceSettings } from "../settings";
import { TYPES } from "../../constants/types";


export const CLA_CHECK_CONTEXT = "CLA Signing"
export const SUCCESS_MESSAGE = "The Contributor License Agreement is signed."
export const FAILURE_MESSAGE = "Please sign our Contributor License Agreement."


@injectable()
class ClaCheckHandler {

  @inject(TYPES.ServiceSettings) private _settings: ServiceSettings
  @inject(TYPES.ClaRepository) private _claRepository: ClaRepository
  @inject(TYPES.StatusChecksService) private _statusCheckService: StatusChecksService

  getTargetUrlWithChallenge(data: ClaCheckInput): string {
    // The target URL for the check must not only point to this instance of the web application
    // to the page that displays the license agreement,
    // it must also include a `state` query string parameter that will be handled through
    // OAuth. The state is necessary to ensure that the same person who opened the PR
    // is the one who authorizes our app and does sign-in to sign the agreement.

    // We create a JWT token, to ensure that the user cannot modify the parameter
    return `${this._settings.url}/contributor-license-agreement?state=${jwt.sign(data, this._settings.secret)}`
  }

  @aretry()
  async checkCla(
    data: ClaCheckInput
  ): Promise<void> {
    const cla = await this._claRepository.getClaByGitHubUserId(data.gitHubUserId);
    let status: StatusCheckInput;

    if (cla == null) {
      status = new StatusCheckInput(
        CheckState.failure,
        this.getTargetUrlWithChallenge(data),
        FAILURE_MESSAGE,
        CLA_CHECK_CONTEXT
      );

      // TODO: add also a comment to the PR,
      // to increase visibility (as in current solution?)

    } else {
      status = new StatusCheckInput(
        CheckState.success,
        `${this._settings.url}/signed-contributor-license-agreement?id=${cla.id}`,
        SUCCESS_MESSAGE,
        CLA_CHECK_CONTEXT
      );
    }

    await this._statusCheckService.createStatus(
      data.repository.ownerId,
      data.repository.fullName,
      data.pullRequest.headSha,
      status
    );
  }
}

export { ClaCheckHandler };
