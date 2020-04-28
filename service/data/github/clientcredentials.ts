import fs from "fs";
import fetch from 'cross-fetch';
import jwt from "jsonwebtoken";
import { expectSuccessfulResponse } from "../../errors"


// Example access token for installation, issued by GitHub:
//
// {
//   "token": "v1.4c864a3bacec0f36664203b7077ad0f37299642b",
//   "expires_at": "2020-04-28T14:43:05Z",
//   "permissions": {
//     "checks": "write",
//     "metadata": "read",
//     "pull_requests": "write",
//     "statuses": "write"
//   },
//   "repository_selection": "selected"
// }


interface GitHubInstallationAccessTokenResult {
  token: string
  expires_at: Date
  permissions: { [key: string]: string }
  repository_selection: string
}


export class GitHubAccessHandler {
  // This class handles client credentials flow to obtain access tokens to interact
  // with our own organization

  private _privateKey: any;
  private _githubApplicationId: Number;

  constructor() {
    this._privateKey = this.getPrivateKey();
    this._githubApplicationId = this.getGitHubApplicationId();
  }

  private getPrivateKeyPath(): string {
    const privateRsaKeyPath = process.env.GITHUB_RSA_PRIVATE_KEY;

    if (!privateRsaKeyPath) {
      throw new Error(
        "Missing GITHUB_RSA_PRIVATE_KEY environmental variable: " +
        "it must contain the path to a private RSA key used to generate JWTs"
      );
    }
    return privateRsaKeyPath;
  }

  private getGitHubApplicationId(): Number {
    const githubApplicationIdRaw = process.env.GITHUB_APPLICATION_ID;

    if (!githubApplicationIdRaw) {
      throw new Error(
        "Missing GITHUB_APPLICATION_ID environmental variable: " +
        "it must contain the id of the GitHub application with organization rights."
      );
    }

    const githubApplicationId = parseInt(githubApplicationIdRaw);

    if (isNaN(githubApplicationId)) {
      throw new Error(
        `Invalid GITHUB_APPLICATION_ID environmental variable: {githubApplicationIdRaw}` +
        "it must contain the id of the GitHub application with organization rights."
      );
    }
    return githubApplicationId;
  }

  private getPrivateKey(): Buffer {
    var privateKeyPath = this.getPrivateKeyPath();
    return fs.readFileSync(privateKeyPath);
  }

  createPrimaryAccessToken(): string {
    // TODO: access tokens can be cached in memory until they expire
    // THIS is low priority since creating a new access token here is cheap

    // NB: new Date().getTime() in JavaScript returns a value in milliseconds
    // it must be converted to seconds here. For example, in Python time.time() is
    // sufficient in this context.
    const time = Math.round(new Date().getTime() / 1000);

    // NB: do not change expiration time, because GitHub doesn't allow
    // access tokens lasting more than 10 minutes.
    // For primary access tokens, the issuer is the GitHub application itself.
    const token = jwt.sign({
      "iat": time,
      "exp": time + (10 * 60),
      "iss": `${this._githubApplicationId}`,
    }, this._privateKey, { algorithm: "RS256" });

    console.info(token);

    return token;
  }

  async getAccessTokenForInstallation(installationId: Number): Promise<string> {
    // The URL to obtain an access token for an installation looks like this:
    // https://api.github.com/app/installations/{installation_id}/access_tokens
    // an installation, in GitHub terminology, refers to a GitHub app being authorized
    // over a certain repository (or possibly even an organization?).

    const primaryAccessToken = this.createPrimaryAccessToken();

    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github.machine-man-preview+json",
          "Authorization": `Bearer ${primaryAccessToken}`
        }
      }
    );

    await expectSuccessfulResponse(response);

    const data: GitHubInstallationAccessTokenResult = await response.json();
    // TODO: access tokens can be cached in memory until they expire!
    // TODO: implement a dedicated class that supports caching of access tokens

    console.info(JSON.stringify(data));

    // https://api.github.com/app/installations
    return data.token;
  }
}
