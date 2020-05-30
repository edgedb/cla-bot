import { getEnvSettingOrThrow } from "./common/settings";
import { injectable } from "inversify";


/**
 * Common service settings, not specific to an external service.
 */
@injectable()
export class ServiceSettings {

  private _url: string;
  private _secret: string;
  private _organizationName: string;

  public get url(): string {
    return this._url;
  }

  public get secret(): string {
    return this._secret;
  }

  public get organizationName(): string {
    return this._organizationName;
  }

  constructor(
    serverUrl?: string,
    secret?: string,
    organizationName?: string
  ) {
    this._url = serverUrl || getEnvSettingOrThrow("SERVER_URL");
    this._secret = secret || getEnvSettingOrThrow("SECRET");
    this._organizationName = (
      organizationName || getEnvSettingOrThrow("ORGANIZATION_NAME")
    );
  }
}
