import {
  OrganizationMember,
  OrganizationsService,
} from "../../../service/domain/organizations";
import {fetchAllItems} from "./utils";
import {injectable} from "inversify";
import {accessHandler, GitHubAccessHandler} from "./clientcredentials";
import {getHeadersForJsonContent} from "./headers";

interface GitHubMemberInfo {
  id: number;
  login: string;
  avatar_url: string;
  site_admin: boolean;
}

@injectable()
export class GitHubOrganizationsService implements OrganizationsService {
  private _access_token_handler: GitHubAccessHandler;

  public constructor() {
    this._access_token_handler = accessHandler;
  }

  async getMembers(
    organization: string,
    role: string
  ): Promise<OrganizationMember[]> {
    const token = await this._access_token_handler.getOrgAccessToken();

    const items = await fetchAllItems<GitHubMemberInfo>(
      `https://api.github.com/orgs/${organization}/members?role=${role}`,
      {
        headers: getHeadersForJsonContent(token),
      }
    );

    return items.map(
      (item) =>
        new OrganizationMember(
          item.id,
          item.login,
          item.avatar_url,
          item.site_admin
        )
    );
  }
}
