import {
  Agreement,
  AgreementListItem,
  AgreementsRepository,
  AgreementText,
  AgreementVersion
  } from "../domain/agreements";
import { inject, injectable } from "inversify";
import {
  InvalidArgumentError,
  NotFoundError,
  InvalidOperationError
} from "../../service/common/web";
import { TYPES } from "../../constants/types";
import { ServerError } from "../common/app";


@injectable()
export class AgreementsHandler
{
  @inject(TYPES.AgreementsRepository)
  private _agreementsRepository: AgreementsRepository

  async getAgreements(): Promise<AgreementListItem[]> {
    return await this._agreementsRepository.getAgreements();
  }

  async getAgreement(id: string): Promise<Agreement | null> {
    return await this._agreementsRepository.getAgreement(id)
  }

  async getAgreementVersion(
    id: string
  ): Promise<AgreementVersion | null> {
    return await this._agreementsRepository.getAgreementVersion(id)
  }

  async updateAgreement(
    id: string,
    name: string,
    description: string
  ): Promise<void> {
    // TODO: check etag!! Disallow updating the entity if etag doesn't match

    if (!name)
      throw new InvalidArgumentError("Missing `name` input parameter.")

    await this._agreementsRepository.updateAgreement(id, name, description)
  }

  async getAgreementTextByVersionAndCulture(
    versionId: string,
    culture: string
  ): Promise<AgreementText | null> {
    const agreementVersion = await this._agreementsRepository
      .getAgreementVersion(versionId)

    if (agreementVersion === null)
      throw new NotFoundError()

      const texts = agreementVersion.texts;

      if (texts === undefined) {
        // Expected populated texts here: this must not happen here
        throw new ServerError(
          "Missing texts property in agreement context."
        );
      }

      const text = texts.filter(item => item.culture === culture)[0];
      return text || null;
  }

  async updateAgreementTextByVersionId(
    versionId: string,
    culture: string,
    title: string,
    body: string
  ): Promise<void> {
    // TODO: check etag!! Disallow updating the entity if etag doesn't match
    // the one on the client side: more than one administrator might be
    // editing the same object at the same time

    if (!title)
      throw new InvalidArgumentError("Missing `title` input parameter.")

    if (!body)
      throw new InvalidArgumentError("Missing `body` input parameter.")

    const agreementVersion = await this._agreementsRepository
      .getAgreementVersion(versionId)

    if (agreementVersion === null)
      throw new NotFoundError()

    if (agreementVersion.draft === false)
      throw new InvalidOperationError(
        "Cannot update an agreement version that is no more a draft."
      )

    const texts = agreementVersion.texts;

    if (texts === undefined) {
      // Expected populated texts here: this must not happen here
      throw new ServerError(
        "Missing texts property in agreement context."
      );
    }

    const text = texts.filter(item => item.culture === culture)[0];

    if (text === null) {
      // TODO: create an agreement text entity associated with
      // the given version
      throw new Error("Not implemented")
    } else {
      // update existing
      await this._agreementsRepository.updateAgreementText(
        text.id,
        title,
        body
      )
    }
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
