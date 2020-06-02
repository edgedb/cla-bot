import jwt from "jsonwebtoken";
import { inject, injectable } from "inversify";
import { SafeError } from "../common/web";
import { ServiceSettings } from "../settings";
import { TYPES } from "../../constants/types";


@injectable()
export class TokensHandler {

  @inject(TYPES.ServiceSettings) private _settings: ServiceSettings

  set settings(value: ServiceSettings) {
    this._settings = value;
  }

  static withServices(settings: ServiceSettings): TokensHandler {
    const handler = new TokensHandler();
    handler.settings = settings;
    return handler;
  }

  createToken(data: any): string {
    return jwt.sign(Object.assign({}, data), this._settings.secret)
  }

  createApplicationToken(data: any, maxAgeInSeconds: number = 7200): string {
    const time = Math.round(new Date().getTime() / 1000);

    return jwt.sign(Object.assign({}, data, {
      "iat": time,
      "exp": time + maxAgeInSeconds,
      "iss": "CLA-Bot",
      "aud": "CLA-Bot"
    }), this._settings.secret);
  }

  verifyToken(rawToken: string): object {
    return jwt.verify(rawToken, this._settings.secret) as object;
  }

  parseToken(rawToken: string): object
  {
    try {
      return this.verifyToken(rawToken);
    } catch (error) {
      throw new SafeError("Token validation error.", error);
    }
  }
}
