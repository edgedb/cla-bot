import jwt from "jsonwebtoken";
import { async_retry } from "../common/resiliency";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks";
import { Cla, ClaCheckInput, ClaRepository } from "../../service/domain/cla";
import { CLA_CHECK_CONTEXT, SUCCESS_MESSAGE } from "./check-cla";
import { ClaCheckHandler } from "./check-cla";
import { CommentsRepository, CommentsService } from "../../service/domain/comments";
import { inject, injectable } from "inversify";
import { SafeError } from "../common/web";
import { ServiceSettings } from "../settings";
import { TYPES } from "../../constants/types";
import { UserInfo, UsersService } from "../../service/domain/users";
import { v4 as uuid } from "uuid";


export interface SignedClaOutput {
  redirectUrl: string
}


@injectable()
class SignClaHandler
{
  @inject(TYPES.UsersService) private _usersService: UsersService
  @inject(TYPES.ServiceSettings) private _settings: ServiceSettings
  @inject(TYPES.ClaRepository) private _claRepository: ClaRepository
  @inject(TYPES.ClaCheckHandler) private _claCheckHandler: ClaCheckHandler
  @inject(TYPES.CommentsService) private _commentsService: CommentsService
  @inject(TYPES.CommentsRepository) private _commentsRepository: CommentsRepository
  @inject(TYPES.StatusChecksService) private _statusCheckService: StatusChecksService

  parseState(rawState: string): ClaCheckInput
  {
    try {
      return jwt.verify(rawState, this._settings.secret) as ClaCheckInput;
    } catch (error) {
      console.error(`State validation error: ${error}`);
      throw new SafeError("State validation error.");
    }
  }

  @async_retry()
  async createCla(user: UserInfo): Promise<Cla> {
    const cla = new Cla(
      uuid(),
      user.id.toString(),
      new Date()
    )

    await this._claRepository.saveCla(cla)
    return cla
  }

  private getAllCommitters(data: ClaCheckInput): string[]
  {
    if (data.committers) {
      return data.committers
    }

    throw new Error("Missing committers information in state.")
  }

  async completeClaCheck(data: ClaCheckInput): Promise<void> {
    await this._statusCheckService.createStatus(
      data.repository.ownerId,
      data.repository.fullName,
      data.pullRequest.headSha,
      new StatusCheckInput(
        CheckState.success,
        `${this._settings.url}/signed-contributor-license-agreement`,
        SUCCESS_MESSAGE,
        CLA_CHECK_CONTEXT
      )
    );

    // if a commet was created, update its text;
    const commentInfo = await this._commentsRepository.getCommentInfoByPullRequestId(
      data.pullRequest.id
    )

    if (commentInfo == null) {
      return;
    }

    await this._commentsService.updateComment(
      data.repository.ownerId,
      data.repository.fullName,
      commentInfo.comment_id,
      this._claCheckHandler.getSignedComment()
    )
  }

  async checkIfAllSigned(data: ClaCheckInput, committers: string[]): Promise<void> {
    const allSigned = await this._claCheckHandler.allCommittersHaveSignedTheCla(committers)

    if (allSigned) {
      await this.completeClaCheck(data);
    }
  }

  async signCla(rawState: string, accessToken: string): Promise<SignedClaOutput> {
    const data = this.parseState(rawState);
    const userInfo = await this._usersService.getUserInfoFromAccessToken(accessToken);

    const committers = this.getAllCommitters(data);

    // ensure that the user who signed up is among those who created the PR
    if (committers.indexOf(userInfo.email) == -1) {
      throw new SafeError(
        `Thank you for authorizing our application, but the CLA must be signed ` +
        `by the users who contributed to the PR. ` +
        `Committers emails are: ${committers}; found here email ${userInfo.email}.`
      )
    }

    await this.createCla(userInfo)
    await this.checkIfAllSigned(data, committers)

    return {
      redirectUrl: data.pullRequest.url
    }
  }
}

export { SignClaHandler }
