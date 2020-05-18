

export interface AgreementsTableItem {
  id: string
  name: string,
  description: string,
  creationTime: string
}


export interface AgreementVersion {
  id: string
  number: string
  current: boolean
  creationTime: string
}


export interface AgreementDetails {
  id: string
  name: string,
  description: string,
  creationTime: string,
  versions: AgreementVersion[]
}
