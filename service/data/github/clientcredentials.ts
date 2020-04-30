import fetch from "cross-fetch";
import fs from "fs";
import jwt from "jsonwebtoken";
import { aretry } from "../../common/resiliency";
import { expectSuccessfulResponse } from "../../common/web";


export class InstallationNotFoundError extends Error {
  constructor(targetAccountId: number) {
    super(`An installation for target account ${targetAccountId} was not found. Is
    the GitHub application authorized to interact with the desired GitHub account?`);
  }
}


interface GitHubInstallationAccessTokenResult {
  token: string
  expires_at: Date
  permissions: { [key: string]: string }
  repository_selection: string
}

// GitHub api returns much more information, but here we care only about the following:
interface GitHubInstallationItem {
  id: number,
  target_id: number
}


export class GitHubAccessHandler {
  // This class handles client credentials flow to obtain access tokens to interact
  // with our own organization

  private _privateKey: Buffer;
  private _githubApplicationId: number;

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

  private getGitHubApplicationId(): number {
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
    // this is low priority since creating a new access token here is cheap

    // NB: new Date().getTime() in JavaScript returns a value in milliseconds
    // it must be converted to seconds for "exp"
    const time = Math.round(new Date().getTime() / 1000);

    return jwt.sign({
      "iat": time,
      "exp": time + (9 * 60),
      "iss": `${this._githubApplicationId}`,
    }, this._privateKey, { algorithm: "RS256" });
  }

  @aretry()
  async getAccessTokenForAccount(
    targetAccountId: number,
    primaryAccessToken?: string
  ): Promise<string> {
    // To get an access token for a GitHub app to interact with a repository,
    // it is necessary to obtain first the "installation id", which represents
    // the authorization of the GitHub app over the target account, and then
    // obtain an access token for the installation.
    // It is possible that a GitHub app has access rights over a different repository,
    // but here for simplicity we don't verify if the app is authorized on the
    // repository where the PR is being done (a call to this API:
    // https://api.github.com/installation/repositories
    // would enable to follow "look before you leap"

    if (!primaryAccessToken)
      primaryAccessToken = this.createPrimaryAccessToken();

    const response = await fetch(
      "https://api.github.com/app/installations",
      {
        method: "GET",
        headers: {
          "Accept": "application/vnd.github.machine-man-preview+json",
          "Authorization": `Bearer ${primaryAccessToken}`
        }
      }
    );

    await expectSuccessfulResponse(response);

    const data: GitHubInstallationItem[] = await response.json();
    var installationId: number | null = null;

    data.forEach(installation => {
      if (installation.target_id == targetAccountId) {
        installationId = installation.id;
      }
    });

    if (installationId == null)
      throw new InstallationNotFoundError(targetAccountId);

    return await this.getAccessTokenForInstallation(installationId);
  }

  @aretry()
  async getAccessTokenForInstallation(
    installationId: number,
    primaryAccessToken?: string
  ): Promise<string> {
    // An installation, in GitHub terminology, refers to a GitHub app being authorized
    // over a certain organization.
    // To interact with repositories inside an organization, we
    // need an access token issued for the installation.

    if (!primaryAccessToken)
      primaryAccessToken = this.createPrimaryAccessToken();

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

    // TODO: access tokens can be cached in memory until they expire!
    // TODO: implement a dedicated class that supports caching of access tokens
    const data: GitHubInstallationAccessTokenResult = await response.json();

    // https://api.github.com/app/installations
    return data.token;
  }
}
