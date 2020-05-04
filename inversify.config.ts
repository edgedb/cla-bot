// ATTENTION: the import of "reflect-metadata" must happen before inversify, otherwise
// inversify doesn't work - so don't sort imports here...
import "reflect-metadata";
import { ClaCheckHandler } from "./service/handlers/check-cla";
import { ClaRepository } from "./service/domain/cla";
import { CommentsRepository, CommentsService } from "./service/domain/comments";
import { Container } from "inversify";
import { EdgeDBClaRepository } from "./service/data/edgedb/cla";
import { EdgeDBCommentsRepository } from "./service/data/edgedb/comments";
import { GitHubStatusChecksAPI } from "./service/data/github/checks";
import { GitHubCommentsService } from "./service/data/github/comments";
import { GitHubUsersService } from "./service/data/github/users";
import { ServiceSettings } from "./service/settings";
import { SignClaHandler } from "./service/handlers/sign-cla";
import { StatusChecksService } from "./service/domain/checks";
import { TYPES } from "./constants/types";
import { UsersService } from "./service/domain/users";

const container = new Container();

container.bind<ClaRepository>(TYPES.ClaRepository)
  .to(EdgeDBClaRepository).inSingletonScope();

container.bind<CommentsRepository>(TYPES.CommentsRepository)
  .to(EdgeDBCommentsRepository).inSingletonScope();

container.bind<StatusChecksService>(TYPES.StatusChecksService)
  .to(GitHubStatusChecksAPI).inSingletonScope();

container.bind<UsersService>(TYPES.UsersService)
  .to(GitHubUsersService);

container.bind<CommentsService>(TYPES.CommentsService)
  .to(GitHubCommentsService);

container.bind<ServiceSettings>(TYPES.ServiceSettings)
  .to(ServiceSettings).inSingletonScope();

container.bind<SignClaHandler>(TYPES.SignClaHandler)
  .to(SignClaHandler);

container.bind<ClaCheckHandler>(TYPES.ClaCheckHandler)
  .to(ClaCheckHandler);

export { container };
