import { inject, injectable } from "inversify";
import { LicensesRepository, License, LicenseDetail, LicenseText } from "../../service/domain/licenses";
import { NotFoundError } from "../common/web";
import { TYPES } from "../../constants/types";


export interface SignedClaOutput {
  redirectUrl: string
}


@injectable()
export class AgreementsHandler
{
  @inject(TYPES.LicensesRepository) private _licensesRepository: LicensesRepository

  async getLicenses(): Promise<License[]> {
    return await this._licensesRepository.getLicenses();
  }

  async getLicenseDetails(id: string): Promise<LicenseDetail> {
    throw new Error("Not implemented")
  }

  async getAgreementTextForRepository(
    repositoryFullName: string,
    cultureCode: string
  ): Promise<LicenseText> {
    const licenseText = await this._licensesRepository.getAgreementTextForRepository(
      repositoryFullName, cultureCode
    )

    if (licenseText == null) {
      throw new NotFoundError(
        `License not found: repository ${repositoryFullName} ${cultureCode}`
      )
    }

    return licenseText
  }

  async getLicenseText(
    versionId: string,
    cultureCode: string
  ): Promise<LicenseText> {
    const licenseText = await this._licensesRepository.getLicenseText(
      versionId, cultureCode
    )

    if (licenseText == null) {
      throw new NotFoundError(`License not found: version ${versionId} ${cultureCode}`)
    }

    return licenseText
  }
}
