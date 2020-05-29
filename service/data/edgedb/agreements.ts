import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";
import {
  AgreementsRepository,
  AgreementListItem,
  AgreementText,
  RepositoryAgreementInfo,
  Agreement,
  AgreementVersion,
  getDefaultVersionNumber
} from "../../domain/agreements";


// The following interfaces describe the shape of DB entities,

interface TextEntity {
  id: string
  title: string
  text: string
  culture: string
  update_time: string
  creation_time: string
}


interface VersionEntity {
  id: string
  number: string
  current: boolean
  draft: boolean
  creation_time: string
  agreement_id?: string[]
  texts?: TextEntity[]
}


function mapTextEntity(entity: TextEntity): AgreementText
{
  return new AgreementText(
    entity.id,
    entity.title,
    entity.text,
    entity.culture,
    "", // TODO: is version id needed?
    new Date(entity.update_time),
    new Date(entity.creation_time)
  )
}

function mapVersionEntity(entity: VersionEntity): AgreementVersion
{
  return new AgreementVersion(
    entity.id,
    entity.number,
    entity.current,
    entity.draft,
    entity.agreement_id ? entity.agreement_id[0] : undefined,
    new Date(entity.creation_time),
    entity.texts ? entity.texts.map(mapTextEntity) : undefined
  )
}


@injectable()
export class EdgeDBAgreementsRepository
  extends EdgeDBRepository implements AgreementsRepository {

  async getAgreement(agreementId: string): Promise<Agreement | null> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Agreement {
          name,
          description,
          creation_time,
          versions: {
            number,
            current,
            draft,
            creation_time
          } ORDER BY .current DESC
        }  FILTER .id = <uuid>$id;`,
        {
          id: agreementId
        }
      )
    })

    if (!items.length)
      return null;

    const agreement = items[0];
    const versions = agreement.versions as VersionEntity[];

    return new Agreement(
      agreement.id,
      agreement.name,
      agreement.description,
      agreement.creation_time,
      versions.map(mapVersionEntity)
    )
  }

  async getAgreementVersion(
    versionId: string
  ): Promise<AgreementVersion | null> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT AgreementVersion {
          number,
          current,
          draft,
          creation_time,
          agreement_id := .<versions[IS Agreement].id,
          texts: {
            text,
            title,
            culture,
            update_time,
            creation_time
          }
        }  FILTER .id = <uuid>$id;`,
        {
          id: versionId
        }
      )
    })

    if (!items.length)
      return null;

    return mapVersionEntity(items[0] as VersionEntity)
  }

  async updateAgreement(
    id: string,
    name: string,
    description: string
  ): Promise<void> {
    await this.run(async (connection) => {
      await connection.fetchOne(
        `
        UPDATE Agreement
        FILTER .id = <uuid>$id
        SET {
          name := <str>$name,
          description := <str>$description,
          update_time := <datetime>$update_time,
        }
        `,
        {
          id,
          name,
          description,
          update_time: new Date()
        }
      )
    })
  }

  async updateAgreementText(
    id: string,
    title: string,
    body: string
  ): Promise<void> {
    await this.run(async (connection) => {
      await connection.fetchOne(
        `
        UPDATE AgreementText
        FILTER .id = <uuid>$id
        SET {
          title := <str>$title,
          text := <str>$body,
          update_time := <datetime>$update_time,
        }
        `,
        {
          id,
          title,
          body,
          update_time: new Date()
        }
      )
    })
  }

  async updateAgreementVersion(
    id: string,
    number: string,
    draft: boolean
  ): Promise<void> {
    await this.run(async (connection) => {
      await connection.fetchOne(
        `
        UPDATE AgreementVersion
        FILTER .id = <uuid>$id
        SET {
          number := <str>$number,
          draft := <bool>$draft
        }
        `,
        {
          id,
          number,
          draft
        }
      )
    })
  }

  async getCurrentAgreementVersionForRepository(
    repositoryFullName: string
  ): Promise<RepositoryAgreementInfo | null> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Repository {
          agreement: {
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
          agreement: {
            versions: {
              number,
              texts: {
                text,
                title,
                culture,
                update_time,
                creation_time
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
    const versionText = currentVersion.texts[0] as TextEntity;
    return mapTextEntity(versionText)
  }

  async getAgreementText(
    versionId: string,
    cultureCode: string
  ): Promise<AgreementText | null> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT AgreementVersion {
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
    const versionText = version.texts[0] as TextEntity;
    return mapTextEntity(versionText)
  }

  async getLicenseForRepository(
    fullRepositoryName: string,
    cultureCode: string
  ): Promise<string | null> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Repository {
          agreement: {
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

  async getAgreements(): Promise<AgreementListItem[]> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Agreement {
          name,
          description,
          creation_time
        };`
      );
    })

    return items.map(entity => new AgreementListItem(
      entity.id,
      entity.name,
      entity.description,
      entity.creation_time
    ));
  }

  async createAgreement(
    name: string,
    description?: string
  ): Promise<AgreementListItem> {
    // For best UX, a new agreement is created with a starting
    // version and English text

    return await this.run(async connection => {
      const creationTime = new Date();
      const result = await connection.fetchAll(
        `
        INSERT Agreement {
          name := <str>$name,
          description := <str>$description,
          creation_time := <datetime>$creation_time,
          versions := {
              (INSERT AgreementVersion {
                  number := <str>$initial_version_number,
                  current := False,
                  texts := (
                      (INSERT AgreementText {
                          title := <str>$initial_title,
                          text := <str>$initial_text,
                          culture := <str>$initial_culture,
                          update_time := datetime_current()
                      })
                  )
              })
          }
      };
        `,
        {
          name: name,
          description: description || "",
          creation_time: creationTime,
          initial_title: name,
          initial_text: "# Modify this markdown",
          initial_culture: "en",
          initial_version_number: getDefaultVersionNumber()
        }
      )
      const item = result[0];
      return new AgreementListItem(
        item.id,
        name,
        description,
        creationTime
      );
    });
  }

  async setCurrentAgreementVersion(
    agreementId: string,
    versionId: string
  ): Promise<void> {
    await this.run(async connection => {
      await connection.fetchAll(`
      WITH X := (SELECT AgreementVersion {
        id,
        agreement_id := .<versions[IS Agreement].id
      }
      FILTER .agreement_id = <uuid>$agreement_id)
      UPDATE X
      SET {
          current := (.id = <uuid>$version_id)
      };
      `, {
        agreement_id: agreementId,
        version_id: versionId
      })
    })
  }
}
