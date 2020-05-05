import jwt from "jsonwebtoken";
import { async_retry } from "../common/resiliency";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks";
import { ClaCheckInput, ClaRepository, Cla } from "../../service/domain/cla";
import { CommentsService, CommentsRepository } from "../../service/domain/comments";
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
  @inject(TYPES.CommentsRepository) private _commentsRepository: CommentsRepository
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

  private async addCommentWithStatus(
    data: ClaCheckInput,
    challengeUrl: string
  ): Promise<void> {
    // was a CLA comment for this PR already written?
    const commentInfo = await this._commentsRepository.getCommentInfoByPullRequestId(
      data.pullRequest.id
    )

    if (commentInfo != null) {
      console.info(`CLA comment already present on PR ${data.pullRequest.number}`);
      return;
    }

    const commentId = await this._commentsService.createComment(
      data.repository.ownerId,
      data.repository.fullName,
      data.pullRequest.number,
      this.getNotSignedComment(challengeUrl)
    )

    await this._commentsRepository.storeCommentInfo(
      commentId,
      data.pullRequest.id,
      new Date()
    );
  }

  @async_retry()
  async checkCla(
    data: ClaCheckInput
  ): Promise<void> {
    // TODO: check by email

    const email = "roberto.prevato+nono@gmail.com";

    const cla = await this._claRepository.getClaByEmailAddress(email);

    let status: StatusCheckInput;

    // TODO: instead of checking the user id,
    // 1. list all commits of the PR (https://api.github.com/repos/RobertoPrevato/GitHubActionsLab/pulls/12/commits?page=9)
    // 1B. if the PR has more than 30 commits, fetch all pages
    // 2. find all unique committers emails (commit.author.email)
    // 3. create a status depending on that

    const challengeUrl = this.getTargetUrlWithChallenge(data);

    if (cla == null) {
      status = new StatusCheckInput(
        CheckState.failure,
        challengeUrl,
        FAILURE_MESSAGE,
        CLA_CHECK_CONTEXT
      );

      // add a comment to increase visibility
      await this.addCommentWithStatus(data, challengeUrl);
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
