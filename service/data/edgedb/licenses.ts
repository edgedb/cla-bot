import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";
import { LicensesRepository, License, LicenseText } from "../../domain/licenses";


@injectable()
export class EdgeDBLicensesRepository extends EdgeDBRepository implements LicensesRepository {

  // async getLicenseDetails(): Promise<LicenseDetail>;

  async getLicenseText(licenseId: string, cultureCode: string): Promise<LicenseText> {
    throw new Error("Not implemented");
  }

  async getLicenseForRepository(
    fullRepositoryName: string,
    cultureCode: string
  ): Promise<string | null> {
    let items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Repository {
          license: {
              versions: {
                  texts: {
                      text
                  } FILTER .culture = <str>$culture
              } FILTER .current = True
          }
        } FILTER .full_name = <str>$full_name;`,
        {
          culture: cultureCode,
          full_name: fullRepositoryName
        }
      )
    })

    if (!items.length)
      return null;

    const item = items[0];
    return item.license?.versions[0]?.texts[0]?.text || null;
  }

  async getLicenses(): Promise<License[]> {
    let items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `select License {
          name,
          description
        };`
      );
    })

    return items.map(entity => new License(entity.id, entity.name, entity.description));
  }

}
