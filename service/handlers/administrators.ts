import { inject, injectable } from "inversify";
import { TYPES } from "../../constants/types";
import {
  Administrator,
  AdministratorsRepository,
} from "../domain/administrators";
import { BadRequestError } from "../common/web";


@injectable()
export class AdministratorsHandler
{
  @inject(TYPES.AdministratorsRepository)
  private _administratorsRepository: AdministratorsRepository

  async getAdministrators(): Promise<Administrator[]> {
    return await this._administratorsRepository.getAdministrators()
  }

  async addAdministrator(email: string): Promise<void> {
    if (!email || !email.trim())
      throw new BadRequestError("Missing email");

    email = email.trim();

    // TODO: validate emails

    // TODO: it would be nice to send an invitation email to new
    // administrators (out of the scope of the MVP)

    await this._administratorsRepository.addAdministrator(email);
  }

  async removeAdministrator(id: string): Promise<void> {
    // TODO: an administrator cannot remove self

    // TODO: it would be appropriate to invalidate any open session
    // by marking JWTs as expired. This requires something like Redis,
    // we cannot validate the state of JWTs at each web request because it
    // kills performance and defeats the purpose of JWTs in the first place.
    // (Out of the scope of the MVP)

    if (!id || !id.trim())
      throw new BadRequestError("Missing id");

    await this._administratorsRepository.removeAdministrator(id);
  }
}
