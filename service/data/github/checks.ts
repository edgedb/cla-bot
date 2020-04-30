import fetch from "cross-fetch";
import { aretry } from "../../common/resiliency";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../domain/checks";
import { expectSuccessfulResponse } from "../../common/web";
import { GitHubAccessHandler } from "./clientcredentials";
import { injectable } from "inversify";


@injectable()
class GitHubStatusChecksAPI implements StatusChecksService {

  private _access_token_handler: GitHubAccessHandler;

  public constructor() {
      this._access_token_handler = new GitHubAccessHandler();
  }

  @aretry()
  async createStatus(
    targetAccountId: number,
    targetRepoFullName: string,
    pullRequestHeadSha: string,
    data: StatusCheckInput
  ): Promise<void> {
    const accessToken = await this._access_token_handler.getAccessTokenForAccount(targetAccountId);

    const response = await fetch(
      `https://api.github.com/repos/${targetRepoFullName}/statuses/${pullRequestHeadSha}`,
      {
        method: "POST",
        body: JSON.stringify({
          state: CheckState[data.state],
          target_url: data.targetUrl,
          description: data.description,
          context: data.context
        }),
        headers: {
          "Accept": "application/vnd.github.machine-man-preview+json",
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Bearer ${accessToken}`
        }
      }
    );

    await expectSuccessfulResponse(response);
  }
}

export { GitHubStatusChecksAPI };
