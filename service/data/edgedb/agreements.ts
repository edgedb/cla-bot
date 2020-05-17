import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";
import {
  AgreementsRepository,
  Agreement,
  AgreementText,
  RepositoryAgreementInfo
} from "../../domain/licenses";


@injectable()
export class EdgeDBAgreementsRepository
  extends EdgeDBRepository implements AgreementsRepository {

  async getCurrentAgreementVersionForRepository(
    repositoryFullName: string
  ): Promise<RepositoryAgreementInfo | null> {
    const items = await this.run(async (connection) => {
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
          full_name: repositoryFullName
        }
      )
    })

    if (!items.length)
      return null;

    const currentVersion = items[0].license?.versions[0];
    return new RepositoryAgreementInfo(
      currentVersion.id,
      currentVersion.number.toString()
    )
  }

  async getAgreementTextForRepository(
    repositoryFullName: string,
    cultureCode: string
  ): Promise<AgreementText | null> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Repository {
          license: {
            versions: {
              number,
              texts: {
                text,
                title,
                culture
              } FILTER .culture = <str>$culture LIMIT 1
            } FILTER .current = True LIMIT 1
          }
        } FILTER .full_name = <str>$full_name;`,
        {
          culture: "en",
          full_name: repositoryFullName
        }
      )
    })

    if (!items.length)
      return null;

    const currentVersion = items[0].license?.versions[0];
    const versionText = currentVersion.texts[0];
    return new AgreementText(
      versionText.title,
      versionText.text,
      cultureCode,
      currentVersion.id
    )
  }

  async getAgreementText(
    versionId: string,
    cultureCode: string
  ): Promise<AgreementText | null> {
    const items = await this.run(async (connection) => {
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

    const version = items[0];
    const text = version.texts[0];
    return new AgreementText(
      text.title,
      text.text,
      text.culture,
      version.id
    )
  }

  async getLicenseForRepository(
    fullRepositoryName: string,
    cultureCode: string
  ): Promise<string | null> {
    const items = await this.run(async (connection) => {
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

  async getAgreements(): Promise<Agreement[]> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT License {
          name,
          description,
          creation_time
        };`
      );
    })

    return items.map(entity => new Agreement(
      entity.id,
      entity.name,
      entity.description,
      entity.creation_time
    ));
  }

  async createAgreement(
    name: string,
    description?: string
  ): Promise<Agreement> {
    return await this.run(async connection => {
      const creationTime = new Date();
      const result = await connection.fetchAll(
        `
        INSERT License {
          name := <str>$name,
          description := <str>$description,
          creation_time := <datetime>$creation_time
        }
        `,
        {
          name: name,
          description: description || "",
          creation_time: creationTime
        }
      )
      const item = result[0];
      return new Agreement(
        item.id,
        name,
        description,
        creationTime
      );
    });
  }
}
