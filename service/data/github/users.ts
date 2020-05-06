import fetch from "cross-fetch";
import { async_retry } from "../../common/resiliency";
import { expectSuccessfulResponse } from "../../common/web";
import { injectable } from "inversify";
import { EmailInfo, UserInfo, UsersService } from "../../domain/users";


@injectable()
export class GitHubUsersService implements UsersService {

  @async_retry()
  async getUserInfoFromAccessToken(accessToken: string): Promise<UserInfo> {
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

  async getUserEmailAddresses(accessToken: string): Promise<EmailInfo[]> {
    var page = 1;
    var emailsInfo: EmailInfo[] = [];

    // handle the unlikely scenario of a user having more than 30 emails configured.
    while (true) {
      const response = await fetch(
        `https://api.github.com/user/emails?page=${page}`,
        {
          method: "GET",
          headers: {
            "Authorization": `token ${accessToken}`
          }
        }
      );

      await expectSuccessfulResponse(response);

      const data = await response.json() as EmailInfo[];
      emailsInfo = emailsInfo.concat(data);

      if (data.length < 30) {
        // there cannot be more items
        break;
      }
    }

    return emailsInfo;
  }
}
