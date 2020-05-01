import jwt from "jsonwebtoken";
import { aretry } from "../common/resiliency";
import { Cla, ClaCheckInput, ClaRepository } from "../../service/domain/cla";
import { inject, injectable } from "inversify";
import { SafeError } from "../common/web";
import { ServiceSettings } from "../settings";
import { TYPES } from "../../constants/types";
import { UserInfo, UsersService } from "../../service/domain/users";
import { v4 as uuid } from "uuid";


@injectable()
class SignClaHandler
{
  @inject(TYPES.ServiceSettings) private _settings: ServiceSettings
  @inject(TYPES.ClaRepository) private _claRepository: ClaRepository
  @inject(TYPES.UsersService) private _usersService: UsersService

//  constructor(
//    @inject(TYPES.ServiceSettings) serviceSettings: ServiceSettings,
//    @inject(TYPES.ClaRepository) claRepository: ClaRepository,
//    @inject(TYPES.UsersService) usersCheckService: UsersService,
//  ) {
//    this._settings = serviceSettings;
//    this._usersService = usersCheckService;
//    this._claRepository = claRepository;
//  }

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
  async createCla(user: UserInfo): Promise<void> {
    await this._claRepository.saveCla(new Cla(
      uuid(),
      user.id,
      new Date()
    ));
  }

  async signCla(rawState: string, accessToken: string) {
    const state = this.parseState(rawState);
    const userInfo = await this._usersService.getUserInfoFromAccessToken(accessToken);

    // NB: ensure that the user who signed up is the same who created the PR
    if (state.gitHubUserId != userInfo.id) {
      throw new SafeError(
        "The GitHub user who posted the PR, is not the same person who just " +
        "signed-in. Thank you for authorizing our application, but the CLA must be " +
        "signed by the user who posted the PR."
      );
    }

    await this.createCla(userInfo);

    // TODO: the user now signed the CLA, mark the PR status as good
  }
}

export { SignClaHandler }
