import jwt from "jsonwebtoken";
import { aretry } from "../common/resiliency";
import { Cla, ClaCheckInput, ClaRepository } from "../../service/domain/cla";
import { container } from "../../inversify.config";
import { SafeError } from "../common/web";
import { ServiceSettings } from "../settings";
import { TYPES } from "../../constants/types";
import { UserInfo, UsersService } from "../../service/domain/users";
import { v4 as uuidv4 } from "uuid";


class SignClaHandler
{
  private _settings: ServiceSettings
  private _claRepository: ClaRepository
  private _usersService: UsersService

  constructor() {
    this._settings = new ServiceSettings();
    this._usersService = container.get<UsersService>(TYPES.UsersService);
    this._claRepository = container.get<ClaRepository>(TYPES.ClaRepository);
  }

  parseState(rawState: string): ClaCheckInput
  {
    try {
      return jwt.verify(rawState, this._settings.secret) as ClaCheckInput;
    } catch (error) {
      console.error(`State validation error: ${error}`);
      throw new SafeError("Failed to validate the state.");
    }
  }

  @aretry()
  async createCla(user: UserInfo): Promise<void> {
    await this._claRepository.saveCla(new Cla(
      uuidv4(),
      user.id,
      new Date()
    ));
  }

  async signCla(rawState: string, accessToken: string) {
    const state = this.parseState(rawState);
    const userInfo = await this._usersService.getUserInfoFromAccessToken(accessToken);

    // NB: ensure that user who signed up is the same who created the PR
    if (state.gitHubUserId != userInfo.id) {
      throw new SafeError(
        "The GitHub user who posted the PR, is not the same person who just " +
        "signed-in. Thank you for authorizing our application, but the CLA must be " +
        "signed by the user who posted the PR."
      );
    }

    await this.createCla(userInfo);
  }
}

export { SignClaHandler }
