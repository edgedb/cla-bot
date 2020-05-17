
export class ExternalRepository {
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


export class Repository {
  id: string
  fullName: string
  agreementId: string

  constructor(
    id: string,
    fullName: string,
    agreementId: string
  ) {
    this.id = id
    this.fullName = fullName
    this.agreementId = agreementId
  }
}


/**
 * Interface to an external API, used to handle information about
 * source code repositories.
 */
export interface RepositoriesService {

  getRepositories(
    organization: string,
    pageNumber: number
  ): Promise<ExternalRepository[]>

}


/**
 * Interface to an internal persistence layer, used to handle information
 * about repositories, stored by the system.
 */
export interface RepositoriesRepository {

  getConfiguredRepositories(): Promise<Repository[]>

}