import { inject, injectable } from "inversify";
import { TYPES } from "../../constants/types";
import {
  RepositoriesService,
  RepositoryInfo
} from "../../service/domain/repositories";


@injectable()
export class RepositoriesHandler
{
  @inject(TYPES.RepositoriesService)
  private _repositoriesServicey: RepositoriesService

  async getAvailableRepositories(
    organization: string,
    pageNumber: number = 1
  ): Promise<RepositoryInfo[]> {

    return await this._repositoriesServicey.getRepositories(
      organization,
      pageNumber
    );
  }
}
