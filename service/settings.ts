



export class ServiceSettings {

  private _url: string;
  // private _githubOAuthApplicationId: string;
  // private _githubOAuthApplicationSecret: string;

  public get url(): string {
    return this._url;
  }

  constructor() {
    // configure in .env file
    this._url = ""; //getEnvSettingOrThrow("SERVER_URL");
  }

  private validate() {
    let array = Object.getOwnPropertyNames(this);

    array.forEach(element => {
      // TODO
      // console.info(element, this[element]);
    });
  }
}
