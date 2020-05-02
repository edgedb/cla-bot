import fetch from "cross-fetch";
import { async_retry } from "../../common/resiliency";
import { expectSuccessfulResponse } from "../../common/web";
import { injectable } from "inversify";
import { UserInfo, UsersService } from "../../domain/users";


@injectable()
export class GitHubUsersService implements UsersService {

  @async_retry()
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
