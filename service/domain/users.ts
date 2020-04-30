

export interface UserInfo {
  id: number
  name: string
  login: string
  url: string
}


export interface UsersService {
  getUserInfoFromAccessToken(accessToken: string): Promise<UserInfo>
}
