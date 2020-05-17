import { inject, injectable } from "inversify";
import {
  AgreementsRepository,
  Agreement,
  AgreementDetail,
  AgreementText
} from "../../service/domain/licenses";
import { NotFoundError } from "../../service/common/web";
import { TYPES } from "../../constants/types";


@injectable()
export class AgreementsHandler
{
  @inject(TYPES.AgreementsRepository)
  private _licensesRepository: AgreementsRepository

  async getLicenses(): Promise<Agreement[]> {
    return await this._licensesRepository.getAgreements();
  }

  async getLicenseDetails(id: string): Promise<AgreementDetail> {
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
    const licenseText = await this._licensesRepository.getAgreementText(
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
