import {async_retry} from "../common/resiliency";
import {
  CheckState,
  StatusCheckInput,
  StatusChecksService,
} from "../../service/domain/checks";
import {ClaCheckInput, ClaRepository} from "../../service/domain/cla";
import {
  CommentsRepository,
  CommentsService,
} from "../../service/domain/comments";
import {inject, injectable} from "inversify";
import {AgreementsRepository} from "../domain/agreements";
import {ServiceSettings} from "../settings";
import {TokensHandler} from "../handlers/tokens";
import {TYPES} from "../../constants/types";

export const CLA_CHECK_CONTEXT = "CLA Signing";
export const SUCCESS_MESSAGE = "The Contributor License Agreement is signed.";
export const FAILURE_MESSAGE =
  "Please sign our Contributor License Agreement.";

@injectable()
class ClaCheckHandler {
  @inject(TYPES.ServiceSettings) private _settings: ServiceSettings;
  @inject(TYPES.ClaRepository) private _claRepository: ClaRepository;

  @inject(TYPES.CommentsService)
  private _commentsService: CommentsService;

  @inject(TYPES.CommentsRepository)
  private _commentsRepository: CommentsRepository;

  @inject(TYPES.StatusChecksService)
  private _statusCheckService: StatusChecksService;

  @inject(TYPES.AgreementsRepository)
  private _agreementsRepository: AgreementsRepository;

  @inject(TYPES.TokensHandler)
  private _tokensHandler: TokensHandler;

  getTargetUrlWithChallenge(data: ClaCheckInput): string {
    // The target URL for the check must not only point to this instance of
    // the web application to the page that displays the license agreement,
    //
    // it must also include a `state` query string parameter that will be
    // handled through OAuth. The state is necessary to ensure that the same
    // person who opened the PR is the one who authorizes our app and does
    // sign-in to sign the agreement.

    // We create a JWT token, to ensure that the user cannot modify the
    // parameter
    const token = this._tokensHandler.createToken(data);
    return (
      `${this._settings.url}/contributor-license-agreement?state=${token}`
    );
  }

  getSignedComment(signedUrl: string): string {
    return (
      `All commit authors signed the Contributor License Agreement. <br/> ` +
      `[![CLA signed](${this._settings.url}/cla-signed.svg)](${signedUrl})`
    );
  }

  getNotSignedComment(challengeUrl: string): string {
    return (
      `Commit authors are required to sign the Contributor License Agreement. <br/> ` +
      `[![CLA not signed](${this._settings.url}/cla-not-signed.svg)](${challengeUrl})`
    );
  }

  private async addCommentWithNegativeStatus(
    data: ClaCheckInput,
    challengeUrl: string
  ): Promise<void> {
    // was a CLA comment for this PR already written?
    const commentInfo = await this._commentsRepository
      .getCommentInfoByPullRequestId(
        data.pullRequest.id
      );

    if (commentInfo != null) {
      // Make sure that the comment is updated with failure information,
      // because the comment might have an outdated positive message.
      // This scenario can happen if: someone first creates a PR and signs
      // the CLA, later asks to be removed from our database
      // (like GDPR in Europe), without completing this PR, finally closes
      // and reopens the PR

      await this._commentsService.updateComment(
        data.repository.ownerId,
        data.repository.fullName,
        commentInfo.commentId,
        this.getNotSignedComment(challengeUrl)
      );
      return;
    }

    const commentId = await this._commentsService.createComment(
      data.repository.ownerId,
      data.repository.fullName,
      data.pullRequest.number,
      this.getNotSignedComment(challengeUrl)
    );

    await this._commentsRepository.storeCommentInfo(
      commentId,
      data.pullRequest.id,
      new Date()
    );
  }

  async allAuthorsHaveSignedTheCla(allAuthors: string[]): Promise<boolean> {
    // This code performs fine in realistic scenarios: most PRs will
    // have a single author email, or only a few.
    // However, someone might trick our service by faking a big number of
    // unique users and a big number of commits.
    // In such unhappy case, it makes sense to handle
    // committers sequentially one by one, to not starve our resources for a
    // single request.

    for (let i = 0; i < allAuthors.length; i++) {
      const email = allAuthors[i];

      const cla = await this._claRepository.getClaByEmailAddress(email);

      if (cla == null) {
        return false;
      }
    }
    return true;
  }

  getSuccessStatusTargetUrl(versionId: string): string {
    // Note: the success status URL is not going to change over time,
    // but the license can change. Here we know that contributors signed
    // a certain version of the CLA, therefore we keep the version id in
    // the status URL: in the future we can display the exact license that
    // was signed at this point in time.
    return (
      `${this._settings.url}/signed-contributor-license-agreement` +
      `?version=${versionId}`
    );
  }

  @async_retry()
  async checkCla(data: ClaCheckInput): Promise<void> {
    // Is an agreement configured for the PR repository?
    // if not, there is no need to do a check for CLA signing
    const currentAgreementForRepository = await this._agreementsRepository
      .getCurrentAgreementVersionForRepository(
        data.repository.fullName
      );

    if (!currentAgreementForRepository) {
      return;
    }

    const allAuthors = await this._statusCheckService
      .getAllAuthorsByPullRequestId(
        data.repository.fullName,
        data.pullRequest.number
      );

    if (!allAuthors.length) {
      throw new Error(
        "Failed to extract the author emails for the pull request."
      );
    }

    // Store authors in the input state, so we don't need to fetch
    // again the same information when validating each author
    // (when each of them authorizes our app);
    data.authors = allAuthors.map((email) => email.toLowerCase());

    let status: StatusCheckInput;

    const challengeUrl = this.getTargetUrlWithChallenge(data);
    const allAuthorsHaveSignedTheCla = await this.allAuthorsHaveSignedTheCla(
      allAuthors
    );

    if (allAuthorsHaveSignedTheCla) {
      status = new StatusCheckInput(
        CheckState.success,
        this.getSuccessStatusTargetUrl(
          currentAgreementForRepository.versionId
        ),
        SUCCESS_MESSAGE,
        CLA_CHECK_CONTEXT
      );
    } else {
      status = new StatusCheckInput(
        CheckState.failure,
        challengeUrl,
        FAILURE_MESSAGE,
        CLA_CHECK_CONTEXT
      );

      // add a comment to increase visibility
      await this.addCommentWithNegativeStatus(data, challengeUrl);
    }

    await this._statusCheckService.createStatus(
      data.repository.ownerId,
      data.repository.fullName,
      data.pullRequest.headSha,
      status
    );
  }
}

export {ClaCheckHandler};
