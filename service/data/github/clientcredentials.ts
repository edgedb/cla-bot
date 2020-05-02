import fetch from "cross-fetch";
import fs from "fs";
import jwt from "jsonwebtoken";
import { async_retry } from "../../common/resiliency";
import { getHeaders } from "./headers";
import { expectSuccessfulResponse } from "../../common/web";


export class InstallationNotFoundError extends Error {
  constructor(targetAccountId: number) {
    super(`An installation for target account ${targetAccountId} was not found. Is
    the GitHub application authorized to interact with the desired GitHub account?`);
  }
}


interface GitHubInstallationAccessTokenResult {
  token: string
  expires_at: string
  permissions: { [key: string]: string }
  repository_selection: string
}


// GitHub api returns much more information, but here we care only about the following:
interface GitHubInstallationItem {
  id: number,
  target_id: number
}


interface AccessToken {
  value: string
  expiresAt: number
}


export class GitHubAccessHandler {
  // This class handles client credentials flow to obtain access tokens to interact
  // with our own organization

  private _privateKey: Buffer;
  private _githubApplicationId: number;
  private _accountAccessTokensCache: { [accountId: number]: AccessToken}

  constructor() {
    this._privateKey = this.getPrivateKey();
    this._githubApplicationId = this.getGitHubApplicationId();
    this._accountAccessTokensCache = {};
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
    const time = Math.round(new Date().getTime() / 1000);

    return jwt.sign({
      "iat": time,
      "exp": time + (9 * 60),
      "iss": `${this._githubApplicationId}`,
    }, this._privateKey, { algorithm: "RS256" });
  }

  setCachedAccessToken(targetAccountId: number, token: AccessToken): void {
    this._accountAccessTokensCache[targetAccountId] = token;
  }

  getCachedAccessToken(targetAccountId: number): AccessToken | null
  {
    if (targetAccountId in this._accountAccessTokensCache) {
      const cachedAccessToken = this._accountAccessTokensCache[targetAccountId];

      // applies a margin of 60 seconds while checking for expiration
      if ((new Date().getTime() + 60000) < cachedAccessToken.expiresAt) {
        console.info(`Reusing a cached access token for account ${targetAccountId}`);
        return cachedAccessToken;
      }

      // remove the expired access token
      delete this._accountAccessTokensCache[targetAccountId];
    }
    return null;
  }

  private async getInstallationIdByAccountId(
    targetAccountId: number,
    primaryAccessToken: string
  ): Promise<number>
  {
    const response = await fetch(
      "https://api.github.com/app/installations",
      {
        method: "GET",
        headers: getHeaders(primaryAccessToken)
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

    return installationId;
  }

  @async_retry()
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
    // would enable to follow "look before you leap")

    // installation access tokens issued by GitHub last one hour, so we cache them
    // in memory and reuse them if possible
    const cachedAccessToken = this.getCachedAccessToken(targetAccountId);

    if (cachedAccessToken !== null) {
      return cachedAccessToken.value;
    }

    if (!primaryAccessToken)
      primaryAccessToken = this.createPrimaryAccessToken();

    const installationId = await this.getInstallationIdByAccountId(
      targetAccountId,
      primaryAccessToken
    )

    const installationAccessTokenResult = await this.getAccessTokenForInstallation(
      installationId
    );

    this.setCachedAccessToken(targetAccountId, {
      value: installationAccessTokenResult.token,
      expiresAt: new Date(installationAccessTokenResult.expires_at).getTime()
    });

    return installationAccessTokenResult.token;
  }

  @async_retry()
  async getAccessTokenForInstallation(
    installationId: number,
    primaryAccessToken?: string
  ): Promise<GitHubInstallationAccessTokenResult> {
    // An installation, in GitHub terminology, refers to a GitHub app being authorized
    // over a certain organization.
    // To interact with repositories inside an organization, we
    // need an access token issued for the installation.
    // https://api.github.com/app/installations

    if (!primaryAccessToken)
      primaryAccessToken = this.createPrimaryAccessToken();

    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: getHeaders(primaryAccessToken)
      }
    );

    await expectSuccessfulResponse(response);

    const data: GitHubInstallationAccessTokenResult = await response.json();
    return data;
  }
}


// we might either configure the class as a singleton service in inversify and inject,
// it into classes that need it, or create a singleton in this module;
// since the classes defined under this namespace are anyway concrete classes
// depending on the GitHub API and using DI in this case doesn't bring benefit,
// the second approach is chosen (also to reduce code verbosity)
const accessHandler = new GitHubAccessHandler();

export { accessHandler };
