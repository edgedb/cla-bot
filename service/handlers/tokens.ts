import jwt from "jsonwebtoken";
import { inject, injectable } from "inversify";
import { SafeError } from "../common/web";
import { ServiceSettings } from "../settings";
import { TYPES } from "../../constants/types";


@injectable()
export class TokensHandler {

  private _settings: ServiceSettings

  constructor(
    @inject(TYPES.ServiceSettings) settings: ServiceSettings
  ) {
    this._settings = settings;
  }

  createToken(data: any): string {
    return jwt.sign(Object.assign({}, data), this._settings.secret)
  }

  parseToken(rawToken: string): object
  {
    try {
      return jwt.verify(rawToken, this._settings.secret) as object;
    } catch (error) {
      throw new SafeError("State validation error.", error);
    }
  }
}
