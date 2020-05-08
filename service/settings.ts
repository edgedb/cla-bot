import { getEnvSettingOrThrow } from "./common/settings";
import { injectable } from "inversify";


/**
 * Common service settings, not specific to an external service.
*/
@injectable()
export class ServiceSettings {

  private _url: string;
  private _secret: string;

  public get url(): string {
    return this._url;
  }

  public get secret(): string {
    return this._secret;
  }

  constructor(serverUrl?: string, secret?: string) {
    this._url = serverUrl || getEnvSettingOrThrow("SERVER_URL");
    this._secret = secret || getEnvSettingOrThrow("SECRET");
  }
}
