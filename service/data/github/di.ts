import {CommentsService} from "../../domain/comments";
import {Container} from "inversify";
import {GitHubCommentsService} from "./comments";
import {GitHubStatusChecksAPI} from "./checks";
import {GitHubUsersService} from "./users";
import {StatusChecksService} from "../../domain/checks";
import {TYPES} from "../../../constants/types";
import {UsersService} from "../../domain/users";
import {RepositoriesService} from "../../domain/repositories";
import {GitHubRepositoriesService} from "./repositories";

export function registerGitHubServices(container: Container): void {
  container
    .bind<StatusChecksService>(TYPES.StatusChecksService)
    .to(GitHubStatusChecksAPI)
    .inSingletonScope();

  container.bind<UsersService>(TYPES.UsersService).to(GitHubUsersService);

  container
    .bind<CommentsService>(TYPES.CommentsService)
    .to(GitHubCommentsService);

  container
    .bind<RepositoriesService>(TYPES.RepositoriesService)
    .to(GitHubRepositoriesService);
}
