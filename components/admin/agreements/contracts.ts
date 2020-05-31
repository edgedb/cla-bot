// The interfaces below describe objects as they are received by the client
// (e.g. Dates are strings!).

// Objects defined in domain namespace are different as they represent
// higher level objects as they are handled by the server side.

export interface AgreementListItem {
  id: string
  name: string,
  description: string,
  creationTime: string
}


export interface AgreementText {
  id: string
  title: string
  text: string
  culture: string
  updateTime: string
  creationTime: string
}


export interface AgreementVersion {
  id: string
  current: boolean
  draft: boolean
  updateTime: string
  creationTime: string
  texts?: AgreementText[]
}


export interface AgreementDetails {
  id: string
  name: string,
  description: string,
  creationTime: string,
  versions: AgreementVersion[]
}
