import { inject, injectable } from "inversify";
import { LicensesRepository, License, LicenseDetail } from "../../service/domain/licenses";
import { NotFoundError } from "../common/web";
import { TYPES } from "../../constants/types";


export interface SignedClaOutput {
  redirectUrl: string
}


@injectable()
export class LicensesHandler
{
  @inject(TYPES.LicensesRepository) private _licensesRepository: LicensesRepository

  async getLicenses(): Promise<License[]> {
    return await this._licensesRepository.getLicenses();
  }

  async getLicenseDetails(id: string): Promise<LicenseDetail> {
    throw new Error("Not implemented")
  }

  async getLicenseText(
    versionId: string,
    cultureCode: string
  ) : Promise<string> {
    const licenseText = await this._licensesRepository.getLicenseText(
      versionId, cultureCode
    )

    if (licenseText == null) {
      throw new NotFoundError(`License agreement not found ${versionId} ${cultureCode}`)
    }

    return licenseText.text
  }
}
