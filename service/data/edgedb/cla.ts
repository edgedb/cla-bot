import { ContributorLicenseAgreement, ClaRepository } from "../../domain/cla";
import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";


interface ClaItem {
  id: string
  email: string
  versionId: string
  creation_time: Date
}


@injectable()
export class EdgeDBClaRepository extends EdgeDBRepository implements ClaRepository {

  async getClaByEmailAddress(
    email: string
  ): Promise<ContributorLicenseAgreement | null> {
    let signed_cla: ClaItem[] = await this.run(async (connection) => {
      return await connection.fetchAll(
        `select ContributorLicenseAgreement {
          email,
          creation_time,
          versionId := .licenseVersion.id
        }
        filter .email = <str>$0;`,
        [email]
      );
    })

    if (signed_cla.length) {
      const item = signed_cla[0];
      return new ContributorLicenseAgreement(
        item.id,
        item.email,
        item.versionId,
        item.creation_time
      );
    }

    return null;
  }

  async saveCla(data: ContributorLicenseAgreement): Promise<void> {
    await this.run(async connection => {
      const result = await connection.fetchAll(
        `
        INSERT ContributorLicenseAgreement {
          email := <str>$email,
          licenseVersion := (SELECT LicenseVersion FILTER .id = <uuid>$version),
          creation_time := <datetime>$creation_time
        }
        `,
        {
          email: data.email,
          version: data.versionId,
          creation_time: data.signed_at
        }
      )
      data.id = result[0].id;
    });
  }
}
