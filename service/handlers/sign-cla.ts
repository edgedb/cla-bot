import jwt from "jsonwebtoken";
import { aretry } from "../common/resiliency";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks";
import { Cla, ClaCheckInput, ClaRepository } from "../../service/domain/cla";
import { CLA_CHECK_CONTEXT, SUCCESS_MESSAGE } from "./check-cla";
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
  @inject(TYPES.ServiceSettings) private _settings: ServiceSettings
  @inject(TYPES.ClaRepository) private _claRepository: ClaRepository
  @inject(TYPES.UsersService) private _usersService: UsersService
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

  @aretry()
  async createCla(user: UserInfo): Promise<Cla> {
    const cla = new Cla(
      uuid(),
      user.id,
      new Date()
    )

    await this._claRepository.saveCla(cla)
    return cla
  }

  async signCla(rawState: string, accessToken: string): Promise<SignedClaOutput> {
    const data = this.parseState(rawState);
    const userInfo = await this._usersService.getUserInfoFromAccessToken(accessToken);

    // ensure that the user who signed up is the same who created the PR
    if (data.gitHubUserId != userInfo.id) {
      throw new SafeError(
        "The GitHub user who posted the PR, is not the same person who just " +
        "signed-in. Thank you for authorizing our application, but the CLA must be " +
        "signed by the user who posted the PR."
      );
    }

    // include the id of the CLA in the status target URL, so we could return
    // information about the signed CLA
    const cla = await this.createCla(userInfo);

    // The user now signed the CLA, mark the check status as passed
    await this._statusCheckService.createStatus(
      data.repository.ownerId,
      data.repository.fullName,
      data.pullRequest.headSha,
      new StatusCheckInput(
        CheckState.success,
        `${this._settings.url}/signed-contributor-license-agreement?id=${cla.id}`,
        SUCCESS_MESSAGE,
        CLA_CHECK_CONTEXT
      )
    );

    return {
      redirectUrl: data.pullRequest.url
    };
  }
}

export { SignClaHandler }
