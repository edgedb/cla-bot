import jwt from "jsonwebtoken";
import { async_retry } from "../common/resiliency";
import { CheckState, StatusCheckInput, StatusChecksService } from "../../service/domain/checks";
import { Cla, ClaCheckInput, ClaRepository } from "../../service/domain/cla";
import { CLA_CHECK_CONTEXT, SUCCESS_MESSAGE } from "./check-cla";
import { ClaCheckHandler } from "./check-cla";
import { CommentsRepository, CommentsService } from "../../service/domain/comments";
import { EmailInfo, UsersService } from "../../service/domain/users";
import { inject, injectable } from "inversify";
import { LicensesRepository } from "../../service/domain/licenses";
import { SafeError } from "../common/web";
import { ServiceSettings } from "../settings";
import { TYPES } from "../../constants/types";
import { v4 as uuid } from "uuid";


export interface SignedClaOutput {
  redirectUrl: string
}


@injectable()
export class LicensesHandler
{
  @inject(TYPES.LicensesRepository) private _licensesRepository: LicensesRepository


  async getLicenseTextByScope() {

  }
}
