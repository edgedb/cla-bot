

export class RepositoryInfo {
  id: number
  name: string
  fullName: string

  constructor(
    id: number,
    name: string,
    fullName: string
  ) {
    this.id = id
    this.name = name
    this.fullName = fullName
  }
}


/**
 * Interface to an external API to handle information about
 * source code repositories.
 */
export interface RepositoriesService {

  getRepositories(
    organization: string,
    pageNumber: number
  ): Promise<RepositoryInfo[]>;

}


/**
 * Interface to an internal persistence layer to handle repository metadata
 * handled by the system.
 */
export interface RepositoriesRepository {

  getConfiguredRepositories(): Promise<RepositoryInfo[]>

}
