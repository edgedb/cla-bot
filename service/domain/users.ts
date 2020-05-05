

export interface UserInfo {
  id: number
  name: string
  login: string
  url: string,
  email: string
}


export interface UsersService {
  getUserInfoFromAccessToken(accessToken: string): Promise<UserInfo>
}
