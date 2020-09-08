import {inject, injectable} from "inversify";
import {BadRequestError, ConflictError} from "../common/web";
import {TYPES} from "../../constants/types";
import {
  ClaRepository,
  ContributorLicenseAgreement,
  ClasImportInput,
  ClasImportOutput,
  ClasImportEntryResult,
} from "../domain/cla";
import {validateEmail} from "../common/emails";
import {AgreementsRepository} from "../domain/agreements";
import {v4 as uuid} from "uuid";
import {ImportEntry} from "../../components/admin/clas/contracts";

function simplifyEntry(entry: ImportEntry): ImportEntry {
  return {
    id: entry.id,
    email: entry.email,
    username: entry.username,
  };
}

@injectable()
export class ClasHandler {
  @inject(TYPES.ClaRepository)
  private _clasRepository: ClaRepository;

  @inject(TYPES.AgreementsRepository)
  private _agreementsRepository: AgreementsRepository;

  async getClaByEmail(
    email: string
  ): Promise<ContributorLicenseAgreement | null> {
    if (!validateEmail(email)) {
      throw new BadRequestError(
        "The given value is not a valid email address"
      );
    }

    return await this._clasRepository.getClaByEmailAddress(email);
  }

  async importClas(data: ClasImportInput): Promise<ClasImportOutput> {
    const agreement = await this._agreementsRepository.getAgreement(
      data.agreementId
    );

    if (agreement === null) {
      throw new BadRequestError(`Agreement not found: ${data.agreementId}`);
    }

    const currentVersion = agreement.versions.find(
      (version) => version.current
    );

    if (!currentVersion) {
      throw new BadRequestError(
        "The selected agreement doesn't have any version marked as complete " +
          "and current."
      );
    }

    // TODO: replace with BULK import handling ON CONFLICT
    const results: ClasImportEntryResult[] = [];
    for (const entry of data.entries) {
      try {
        // validate email
        if (!validateEmail(entry.email)) {
          results.push({
            success: false,
            entry: simplifyEntry(entry),
            error: "Invalid email",
          });
          continue;
        }

        // TODO: store username, too, when supported
        await this._clasRepository.saveCla(
          new ContributorLicenseAgreement(
            uuid(),
            entry.email.trim().toLowerCase(),
            entry.username.trim(),
            currentVersion.id,
            new Date()
          )
        );
        results.push({
          success: true,
          entry: simplifyEntry(entry),
        });
      } catch (error) {
        if (error instanceof ConflictError) {
          // There is already an item with the given email address
          results.push({
            success: true,
            entry: simplifyEntry(entry),
          });
        } else {
          results.push({
            success: false,
            entry: simplifyEntry(entry),
            error: error.toString(),
          });
        }
      }
    }
    return {
      results,
    };
  }
}
