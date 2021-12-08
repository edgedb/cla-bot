import {ContributorLicenseAgreement, ClaRepository} from "../../domain/cla";
import {EdgeDBRepository} from "./base";
import {injectable} from "inversify";

interface ClaItem {
  id: string;
  email: string;
  username: string;
  versionId: string;
  creation_time: Date;
}

@injectable()
export class EdgeDBClaRepository
  extends EdgeDBRepository
  implements ClaRepository
{
  async getClaByEmailAddress(
    email: string
  ): Promise<ContributorLicenseAgreement | null> {
    const signed_cla = await this.run(async (connection) => {
      return await connection.querySingle<ClaItem>(
        `SELECT ContributorLicenseAgreement {
          email,
          username,
          creation_time,
          versionId := .agreement_version.id
        }
        FILTER .email = <str>$0;`,
        [email]
      );
    });

    if (signed_cla) {
      return new ContributorLicenseAgreement(
        signed_cla.id,
        signed_cla.email,
        signed_cla.username,
        signed_cla.versionId,
        signed_cla.creation_time
      );
    }

    return null;
  }

  async saveCla(data: ContributorLicenseAgreement): Promise<void> {
    await this.run(async (connection) => {
      const result = await connection.queryRequiredSingle<{id: string}>(
        `
        INSERT ContributorLicenseAgreement {
          email := <str>$email,
          username := <str>$username,
          agreement_version := (SELECT AgreementVersion FILTER .id = <uuid>$version),
          creation_time := <datetime>$creation_time
        }
        `,
        {
          email: data.email,
          username: data.username,
          version: data.versionId,
          creation_time: data.signedAt,
        }
      );
      data.id = result.id;
    });
  }
}
