export class OrganizationMember {
  login: string;
  id: number;
  avatarUrl: string;
  siteAdmin: boolean;

  constructor(
    id: number,
    login: string,
    avatarUrl: string,
    siteAdmin: boolean
  ) {
    this.id = id;
    this.login = login;
    this.avatarUrl = this.avatarUrl;
    this.siteAdmin = siteAdmin;
  }
}

/**
 * Interface to an external API, used to handle information about
 * organizations.
 */
export interface OrganizationsService {
  getMembers(
    organization: string,
    role: string
  ): Promise<OrganizationMember[]>;
}
