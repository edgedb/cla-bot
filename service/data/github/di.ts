import { CommentsService } from "../../domain/comments";
import { Container } from "inversify";
import { GitHubCommentsService } from "./comments";
import { GitHubStatusChecksAPI } from "./checks";
import { GitHubUsersService } from "./users";
import { StatusChecksService } from "../../domain/checks";
import { TYPES } from "../../../constants/types";
import { UsersService } from "../../domain/users";


export function registerGitHubServices(container: Container) {
  container.bind<StatusChecksService>(TYPES.StatusChecksService)
  .to(GitHubStatusChecksAPI).inSingletonScope();

  container.bind<UsersService>(TYPES.UsersService)
    .to(GitHubUsersService);

  container.bind<CommentsService>(TYPES.CommentsService)
    .to(GitHubCommentsService);
}
