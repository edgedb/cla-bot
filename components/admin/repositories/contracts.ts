// The interfaces below describe objects as they are received by the client
// (e.g. Dates are strings!).

// Objects defined in domain namespace are different as they represent
// higher level objects as they are handled by the server side.


/**
 * Data about a GitHub repository.
 */
export interface ExternalRepository {
  id: number
  name: string
  fullName: string
}

/**
 * Data about a repository configured in the CLA-Bot system,
 * that is a repository associated with an agreement.
 */
export interface Repository {
  id: string
  agreementId: string
  agreementName: string
  fullName: string
}
