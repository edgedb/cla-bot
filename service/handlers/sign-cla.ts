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
import { UserInfo, UsersService, EmailInfo } from "../../service/domain/users";
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
  async createCla(emailInfo: EmailInfo): Promise<Cla> {
    const cla = new Cla(
      uuid(),
      emailInfo.email.toString(),
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
      commentInfo.commentId,
      this._claCheckHandler.getSignedComment()
    )
  }

  async checkIfAllSigned(data: ClaCheckInput, committers: string[]): Promise<void> {
    const allSigned = await this._claCheckHandler.allCommittersHaveSignedTheCla(committers)

    if (allSigned) {
      await this.completeClaCheck(data);
    }
  }

  private getAllMatchingEmails(
    committers: string[],
    userEmails: EmailInfo[]
  ): EmailInfo[] {
    return userEmails.filter(emailInfo => {
      if (!emailInfo.email) {
        // this should never happen
        return false;
      }

      const lowerEmailAddress = emailInfo.email.toLowerCase();
      return committers.indexOf(lowerEmailAddress) > -1;
    });
  }

  private ensureThatEmailIsVerified(emailInfo: EmailInfo): void {
    if (emailInfo.verified === false) {
      throw new SafeError(
        `Email address: ${emailInfo.email} is not verified. ` +
        `Please verify your email address and try again.`
      );
    }
  }

  async signCla(rawState: string, accessToken: string): Promise<SignedClaOutput> {
    //
    // A user just signed-in, after authorizing the OAuth app that can read email
    // addresses.
    //
    // This method handles the unlikely scenario of a single user committing using
    // several email addresses, and being owner of all of them.
    //
    const data = this.parseState(rawState);
    const committers = this.getAllCommitters(data);
    const userEmails = await this._usersService.getUserEmailAddresses(accessToken);

    const matchingEmails = this.getAllMatchingEmails(committers, userEmails);

    if (!matchingEmails.length) {
      // The user who signed in is not among those who contributed to the PR
      // NB: this can also happen if the user has a private email address,
      // and wants to preserve email privacy when committing.
      // As of today, it is unclear how this scenario should be handled.
      //
      throw new SafeError(
        `Thank you for authorizing our application, but the CLA must be signed ` +
        `by the users who contributed to the PR. ` +
        `Committers emails are: ${committers}.`
      )
    }

    matchingEmails.forEach(async matchingEmail => {
      this.ensureThatEmailIsVerified(matchingEmail);

      // did the user already signed the CLA with this email address?
      const existingCla = await this._claRepository.getClaByEmailAddress(
        matchingEmail.email.toLowerCase()
      );

      if (existingCla == null) {
        await this.createCla(matchingEmail)
      }
    });

    await this.checkIfAllSigned(data, committers)

    return {
      redirectUrl: data.pullRequest.url
    }
  }
}

export { SignClaHandler }
