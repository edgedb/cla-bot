import { inject, injectable } from "inversify";
import {
  AgreementsRepository,
  AgreementListItem,
  Agreement,
  AgreementText
} from "../domain/agreements";
import { NotFoundError } from "../../service/common/web";
import { TYPES } from "../../constants/types";


@injectable()
export class AgreementsHandler
{
  @inject(TYPES.AgreementsRepository)
  private _agreementsRepository: AgreementsRepository

  async getAgreements(): Promise<AgreementListItem[]> {
    return await this._agreementsRepository.getAgreements();
  }

  async getAgreementDetails(id: string): Promise<Agreement | null> {
    return await this._agreementsRepository.getAgreement(id)
  }

  async createAgreement(
    name: string,
    description?: string
  ): Promise<AgreementListItem> {
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
