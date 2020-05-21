

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
  updateTime: string
  creationTime: string
}


export interface AgreementDetails {
  id: string
  name: string,
  description: string,
  creationTime: string,
  versions: AgreementVersion[]
}
