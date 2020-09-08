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
export class EdgeDBClaRepository extends EdgeDBRepository
  implements ClaRepository {
  async getClaByEmailAddress(
    email: string
  ): Promise<ContributorLicenseAgreement | null> {
    const signed_cla: ClaItem[] = await this.run(async (connection) => {
      return await connection.query(
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

    if (signed_cla.length) {
      const item = signed_cla[0];
      return new ContributorLicenseAgreement(
        item.id,
        item.email,
        item.username,
        item.versionId,
        item.creation_time
      );
    }

    return null;
  }

  async saveCla(data: ContributorLicenseAgreement): Promise<void> {
    await this.run(async (connection) => {
      const result = await connection.query(
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
      data.id = result[0].id;
    });
  }
}
