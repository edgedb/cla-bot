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
          agreementId := .license.id
        };`
      );
    })

    return items.map(entity => new Repository(
      entity.id,
      entity.full_name,
      entity.agreementId
    ));
  }

}
