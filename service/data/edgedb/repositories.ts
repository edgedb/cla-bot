import {EdgeDBRepository} from "./base";
import {injectable} from "inversify";
import {RepositoriesRepository, Repository} from "../../domain/repositories";

@injectable()
export class EdgeDBRepositoriesRepository
  extends EdgeDBRepository
  implements RepositoriesRepository
{
  async getConfiguredRepositories(): Promise<Repository[]> {
    const items = await this.run(async (connection) => {
      return await connection.query<{
        id: string;
        full_name: string;
        agreementId: string;
        agreementName: string;
      }>(
        `SELECT Repository {
          full_name,
          agreementId := .agreement.id,
          agreementName := .agreement.name
        };`
      );
    });

    return items.map(
      (entity) =>
        new Repository(
          entity.id,
          entity.full_name,
          entity.agreementId,
          entity.agreementName
        )
    );
  }

  async createRepositoryConfiguration(
    agreementId: string,
    repositoryId: string
  ): Promise<void> {
    await this.run(async (connection) => {
      await connection.query(
        `
        INSERT Repository {
          full_name := <str>$repository_id,
          agreement := (SELECT Agreement FILTER .id = <uuid>$agreement_id)
        }
        `,
        {
          repository_id: repositoryId,
          agreement_id: agreementId,
        }
      );
    });
  }

  async deleteRepositoryConfiguration(id: string): Promise<void> {
    await this.run(async (connection) => {
      await connection.queryRequiredSingle(
        `
        DELETE Repository FILTER .id = <uuid>$id
        `,
        {
          id,
        }
      );
    });
  }
}
