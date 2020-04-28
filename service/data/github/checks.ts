import fetch from 'cross-fetch';
import { injectable } from "inversify"
import { CheckState, StatusCheckInput, StatusChecksService } from "../../domain/checks"
import { GitHubAccessHandler } from "./clientcredentials"
import { expectSuccessfulResponse } from "../../errors"


@injectable()
class GitHubStatusChecksAPI implements StatusChecksService {

  private _access_token_handler: GitHubAccessHandler;

  public constructor() {
      this._access_token_handler = new GitHubAccessHandler();
  }

  private getCreateStatusUrl(): string {
    return "https://api.github.com/repos/RobertoPrevato/GitHubActionsLab/statuses/4118e153a7daf229da6439d630c6c7c6bbeffed9";
  }

  async createStatus(
    data: StatusCheckInput
  ): Promise<void> {

    const createStatusUrl = this.getCreateStatusUrl();
    const accessToken = await this._access_token_handler.getAccessTokenForInstallation(8377700);

    // TODO: obtain an access token for the installation
    // URL looks like this: https://api.github.com/repos/RobertoPrevato/GitHubActionsLab/statuses/4118e153a7daf229da6439d630c6c7c6bbeffed9
    const response = await fetch(createStatusUrl, {
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
    });

    await expectSuccessfulResponse(response);
  }
}

export { GitHubStatusChecksAPI };
