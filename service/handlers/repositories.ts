import { inject, injectable } from "inversify";
import { TYPES } from "../../constants/types";
import {
  RepositoriesService,
  ExternalRepository,
  RepositoriesRepository,
  Repository
} from "../../service/domain/repositories";


@injectable()
export class RepositoriesHandler
{
  @inject(TYPES.RepositoriesService)
  private _repositoriesService: RepositoriesService

  @inject(TYPES.RepositoriesRepository)
  private _repositoriesRepository: RepositoriesRepository

  async getAvailableRepositories(
    organization: string,
    pageNumber: number = 1
  ): Promise<ExternalRepository[]> {

    return await this._repositoriesService.getRepositories(
      organization,
      pageNumber
    )
  }

  async getConfiguredRepositories(): Promise<Repository[]> {
    return await this._repositoriesRepository.getConfiguredRepositories()
  }

  async bindRepositoryToLicenseAgreement(): Promise<void> {
    //
  }
}
