import { inject, injectable } from "inversify";
import { BadRequestError } from "../common/web";
import { TYPES } from "../../constants/types";
import { ClaRepository, ContributorLicenseAgreement } from "../domain/cla";
import { validateEmail } from "../common/emails";


@injectable()
export class ClasHandler
{
  @inject(TYPES.ClaRepository)
  private _clasRepository: ClaRepository

  async getClaByEmail(
    email: string
  ): Promise<ContributorLicenseAgreement | null>
  {
    if (!validateEmail(email)) {
      throw new BadRequestError(
        "The given value is not a valid email address"
      );
    }

    return await this._clasRepository.getClaByEmailAddress(email);
  }

}
