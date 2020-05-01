import { getEnvSettingOrThrow } from "./common/settings";
import { injectable } from "inversify";


@injectable()
export class ServiceSettings {
  // common service settings, not specific to an external service

  private _url: string;
  private _secret: string;

  public get url(): string {
    return this._url;
  }

  public get secret(): string {
    return this._secret;
  }

  constructor() {
    this._url = getEnvSettingOrThrow("SERVER_URL");
    this._secret = getEnvSettingOrThrow("SECRET");
  }
}
