import { inject, injectable } from "inversify";
import { TYPES } from "../../constants/types";
import {
  RepositoriesService,
  ExternalRepository,
  RepositoriesRepository,
  Repository
} from "../../service/domain/repositories";
import { ServiceSettings } from "../settings";
import { BadRequestError } from "../common/web";


@injectable()
export class RepositoriesHandler
{
  @inject(TYPES.ServiceSettings)
  private _settings: ServiceSettings

  @inject(TYPES.RepositoriesService)
  private _repositoriesService: RepositoriesService

  @inject(TYPES.RepositoriesRepository)
  private _repositoriesRepository: RepositoriesRepository

  async getAvailableRepositories(): Promise<ExternalRepository[]> {
    return await this._repositoriesService.getRepositories(
      this._settings.organizationName
    )
  }

  async getConfiguredRepositories(): Promise<Repository[]> {
    return await this._repositoriesRepository.getConfiguredRepositories()
  }

  async createRepositoryConfiguration(
    agreementId: string,
    repositoryId: string
  ): Promise<void> {

    if (!agreementId)
      throw new BadRequestError("Missing agreement id");

    if (!repositoryId)
      throw new BadRequestError("Missing repository id");

    await this._repositoriesRepository.createRepositoryConfiguration(
      agreementId,
      repositoryId
    )
  }
}
