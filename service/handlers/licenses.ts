import { inject, injectable } from "inversify";
import { AgreementsRepository, Agreement, AgreementDetail, AgreementText } from "../../service/domain/licenses";
import { NotFoundError } from "../common/web";
import { TYPES } from "../../constants/types";


export interface SignedClaOutput {
  redirectUrl: string
}


@injectable()
export class AgreementsHandler
{
  @inject(TYPES.AgreementsRepository)
    private _agreementsRepository: AgreementsRepository

  async getLicenses(): Promise<Agreement[]> {
    return await this._agreementsRepository.getAgreements();
  }

  async getLicenseDetails(id: string): Promise<AgreementDetail> {
    throw new Error("Not implemented")
  }

  async createAgreement(
    name: string,
    description?: string
  ): Promise<Agreement> {
    return await this._agreementsRepository.createAgreement(
      name, description
    );
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
    const licenseText = await this._agreementsRepository
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
    const licenseText = await this._agreementsRepository.getAgreementText(
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
