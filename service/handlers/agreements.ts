import { inject, injectable } from "inversify";
import {
  LicensesRepository,
  Agreement,
  LicenseDetail,
  AgreementText
} from "../../service/domain/licenses";
import { NotFoundError } from "../../service/common/web";
import { TYPES } from "../../constants/types";


@injectable()
export class AgreementsHandler
{
  @inject(
    TYPES.LicensesRepository) private _licensesRepository: LicensesRepository

  async getLicenses(): Promise<Agreement[]> {
    return await this._licensesRepository.getLicenses();
  }

  async getLicenseDetails(id: string): Promise<LicenseDetail> {
    throw new Error("Not implemented")
  }

  /**
   * Returns the current agreement text for a given repository,
   * and a given culture.
   *
   * @param repositoryFullName
   * @param cultureCode
   */
  async getAgreementTextForRepository(
    repositoryFullName: string,
    cultureCode: string
  ): Promise<AgreementText> {
    const licenseText = await this._licensesRepository
      .getAgreementTextForRepository(repositoryFullName, cultureCode)

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
  ): Promise<AgreementText> {
    const licenseText = await this._licensesRepository.getLicenseText(
      versionId, cultureCode
    )

    if (licenseText == null) {
      throw new NotFoundError(
        `License not found: version ${versionId} ${cultureCode}`
      )
    }

    return licenseText
  }
}
