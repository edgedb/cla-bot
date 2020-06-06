import jwt from "jsonwebtoken";
import {inject, injectable} from "inversify";
import {SafeError} from "../common/web";
import {ServiceSettings} from "../settings";
import {TYPES} from "../../constants/types";

@injectable()
export class TokensHandler {
  @inject(TYPES.ServiceSettings) private _settings: ServiceSettings;

  set settings(value: ServiceSettings) {
    this._settings = value;
  }

  static withServices(settings: ServiceSettings): TokensHandler {
    const handler = new TokensHandler();
    handler.settings = settings;
    return handler;
  }

  /**
   * Creates a generic JWT without expiration.
   * The only purpose of such token is to ensure that end users cannot modify
   * payloads. For example, this is used to generate `state` parameters
   * for the OAuth flow for contributors' sign-in.
   */
  createToken(data: any): string {
    return jwt.sign(Object.assign({}, data), this._settings.secret);
  }

  /**
   * Creates an access token to be used by the application itself:
   * here issuer and audience are the same entity.
   * Access tokens are signed using a configured secret, therefore using
   * symmetric encryption.
   *
   * Tokens by default are valid for 24 hours.
   *
   * This is sufficient for the current scope of the project. In the future
   * the solution can be improved using different solutions, such as tokens
   * issued by an identity provider (such as Auth0), or using RSA keys,
   * thus enabling third parties to validate the tokens issued by the
   * application.
   */
  createApplicationToken(data: any, maxAgeInSeconds: number = 86400): string {
    const time = Math.round(new Date().getTime() / 1000);

    return jwt.sign(
      Object.assign({}, data, {
        iat: time,
        exp: time + maxAgeInSeconds,
        iss: "CLA-Bot",
        aud: "CLA-Bot",
      }),
      this._settings.secret
    );
  }

  verifyToken(rawToken: string): object {
    return jwt.verify(rawToken, this._settings.secret) as object;
  }

  parseToken(rawToken: string): object {
    try {
      return this.verifyToken(rawToken);
    } catch (error) {
      throw new SafeError("Token validation error.", error);
    }
  }
}
