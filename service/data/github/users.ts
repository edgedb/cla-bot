import fetch from "cross-fetch";
import { aretry } from "../../common/resiliency";
import { expectSuccessfulResponse } from "../../common/web";
import { injectable } from "inversify";
import { UserInfo, UsersService } from "../../domain/users";


@injectable()
class GitHubUsersService implements UsersService {

  @aretry()
  async getUserInfoFromAccessToken(accessToken: string) {
    const response = await fetch(
      "https://api.github.com/user",
      {
        method: "GET",
        headers: {
          "Authorization": `token ${accessToken}`
        }
      }
    );

    await expectSuccessfulResponse(response);

    return await response.json() as UserInfo;
  }

}

export { GitHubUsersService };
