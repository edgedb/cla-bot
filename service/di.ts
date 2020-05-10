// ATTENTION: the import of "reflect-metadata" must happen before inversify, otherwise
// inversify doesn't work - so don't sort imports here...
import "reflect-metadata";
import { ClaCheckHandler } from "./handlers/check-cla";
import { ClaRepository } from "./domain/cla";
import { CommentsRepository, CommentsService } from "./domain/comments";
import { Container } from "inversify";
import { EdgeDBClaRepository } from "./data/edgedb/cla";
import { EdgeDBCommentsRepository } from "./data/edgedb/comments";
import { GitHubStatusChecksAPI } from "./data/github/checks";
import { GitHubCommentsService } from "./data/github/comments";
import { GitHubUsersService } from "./data/github/users";
import { ServiceSettings } from "./settings";
import { SignClaHandler } from "./handlers/sign-cla";
import { StatusChecksService } from "./domain/checks";
import { TYPES } from "../constants/types";
import { UsersService } from "./domain/users";
import { TokensHandler } from "./handlers/tokens";


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
  .toConstantValue(new ServiceSettings());

container.bind<SignClaHandler>(TYPES.SignClaHandler)
  .to(SignClaHandler);

container.bind<ClaCheckHandler>(TYPES.ClaCheckHandler)
  .to(ClaCheckHandler);

container.bind<TokensHandler>(TYPES.TokensHandler)
  .to(TokensHandler);

export { container };
