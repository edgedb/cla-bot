

export interface UserInfo {
  id: number
  name: string
  login: string
  url: string,
  email: string | null
}


export interface EmailInfo {
  email: string
  verified: boolean
  primary: boolean
  visibility: string
}


export interface UsersService {
  // TODO: deprecate this method
  getUserInfoFromAccessToken(accessToken: string): Promise<UserInfo>

  getUserEmailAddresses(accessToken: string): Promise<EmailInfo[]>
}
