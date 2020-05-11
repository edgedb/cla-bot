import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";
import { LicensesRepository, License, LicenseText, RepositoryLicenseInfo } from "../../domain/licenses";


@injectable()
export class EdgeDBLicensesRepository extends EdgeDBRepository implements LicensesRepository {

  async getCurrentLicenseVersionForRepository(
    fullRepositoryName: string
  ): Promise<RepositoryLicenseInfo | null> {
    let items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Repository {
          license: {
            versions: {
              number
            } FILTER .current = True and .texts.culture = <str>$culture LIMIT 1
          }
        } FILTER .full_name = <str>$full_name;`,
        {
          culture: "en",
          full_name: fullRepositoryName
        }
      )
    })

    if (!items.length)
      return null;

    const currentVersion = items[0].license?.versions[0];
    return new RepositoryLicenseInfo(
      currentVersion.id,
      currentVersion.number.toString()
    )
  }

  async getLicenseText(
    versionId: string,
    cultureCode: string
  ): Promise<LicenseText | null> {
    let items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT LicenseVersion {
          texts: {
            text,
            title,
            culture
          } FILTER .culture = <str>$culture LIMIT 1
        } FILTER .id = <uuid>$version_id;`,
        {
          culture: cultureCode,
          version_id: versionId
        }
      )
    })

    if (!items.length)
      return null;

    const text = items[0].texts[0];
    return new LicenseText(
      text.id,
      text.title,
      text.text,
      text.culture
    )
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
