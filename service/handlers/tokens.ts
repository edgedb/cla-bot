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

  parseToken(rawToken: string): object
  {
    try {
      return jwt.verify(rawToken, this._settings.secret) as object;
    } catch (error) {
      throw new SafeError("Token validation error.", error);
    }
  }
}
