import jwt from "jsonwebtoken";
import { async_retry } from "../common/resiliency";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks";
import { ClaCheckInput, ClaRepository } from "../../service/domain/cla";
import { CommentsService } from "../../service/domain/comments";
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
  @inject(TYPES.CommentsService) private _commentsService: CommentsService
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

  // TODO: put in another place
  private getSignedComment(): string {
    return `All committers signed the Contributor License Agreement. <br/> ` +
    `![CLA signed](${this._settings.url}/cla-signed.svg)`
  }

  private getNotSignedComment(challengeUrl: string): string {
    return `Committers are required to sign the Contributor License Agreement. <br/> ` +
    `[![CLA not signed](${this._settings.url}/cla-not-signed.svg)](${challengeUrl})`
  }

  @async_retry()
  async checkCla(
    data: ClaCheckInput
  ): Promise<void> {
    // TODO: check by email

    const email = "example@foo.org";

    const cla = await this._claRepository.getClaByEmailAddress(email);

    let status: StatusCheckInput;

    // TODO: instead of checking the user id,
    // 1. list all commits of the PR (https://api.github.com/repos/RobertoPrevato/GitHubActionsLab/pulls/12/commits?page=9)
    // 1B. if the PR has more than 30 commits, fetch all pages
    // 2. find all unique committers emails (commit.author.email)
    // 3. create a status depending on that

    // Unfortunately, it is necessary to find a comment.

    // Note: it is possible to include an HTML comment into the comment, to
    const challengeUrl = this.getTargetUrlWithChallenge(data);

    // TODO: the following condition is wrong - instead check if a comment was already
    // published! Because if the check fails the first time, then there is no comment.
    if (data.action == "opened") {
      // add a comment to the PR,
      // to increase visibility; the id of this comment is stored in the state,
      // so we can easily update it once all committers sign the CLA
      const commentId = await this._commentsService.createComment(
        data.repository.ownerId,
        data.repository.fullName,
        data.pullRequest.number,
        this.getNotSignedComment(challengeUrl)
      )
    }

    // TODO: include comment id in state?

    if (cla == null) {
      status = new StatusCheckInput(
        CheckState.failure,
        challengeUrl,
        FAILURE_MESSAGE,
        CLA_CHECK_CONTEXT
      );

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
