import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";
import { RepositoriesRepository, Repository } from "../../domain/repositories";


@injectable()
export class EdgeDBRepositoriesRepository
  extends EdgeDBRepository implements RepositoriesRepository {

  async getConfiguredRepositories(): Promise<Repository[]> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Repository {
          full_name,
          agreementId := .agreement.id
        };`
      );
    })

    return items.map(entity => new Repository(
      entity.id,
      entity.full_name,
      entity.agreementId
    ));
  }

  async createRepositoryConfiguration(
    agreementId: string,
    repositoryId: string
  ): Promise<void> {
    await this.run(async connection => {
      await connection.fetchAll(
        `
        INSERT Repository {
          full_name := <str>$repository_id,
          agreement := (SELECT Agreement FILTER .id = <uuid>$agreement_id)
        }
        `,
        {
          repository_id: repositoryId,
          agreement_id: agreementId
        }
      )
    });
  }
}
