// TODO:
// if we modify the `appFetch` wrapper to automatically parse date strings
// into dates, we can remove the following classes, and reuse the same objects
// defined in domain namespace.

// The difference is that objects defined in domain, are handled by the
// server side and returned serialized in JSON
// While the following contract interfaces are the objects how they look like
// when received and deserialized on the client (e.g. Dates are strings!)


export interface AgreementsTableItem {
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
  number: string
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
