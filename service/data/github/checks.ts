import fetch from "cross-fetch";
import { accessHandler, GitHubAccessHandler } from "./clientcredentials";
import { async_retry } from "../../common/resiliency";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../domain/checks";
import { expectSuccessfulResponse } from "../../common/web";
import { getHeadersForJsonContent } from "./headers";
import { injectable } from "inversify";


@injectable()
export class GitHubStatusChecksAPI implements StatusChecksService {

  private _access_token_handler: GitHubAccessHandler;

  public constructor() {
      this._access_token_handler = accessHandler;
  }

  @async_retry()
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
        headers: getHeadersForJsonContent(accessToken)
      }
    );

    await expectSuccessfulResponse(response);
  }
}
