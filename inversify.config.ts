// ATTENTION: the import of "reflect-metadata" must happen before inversify, otherwise
// inversify doesn't work - so don't sort imports here...
import "reflect-metadata";
import { ClaRepository } from "./service/domain/cla";
import { Container } from "inversify";
import { EdgeDBClaRepository } from "./service/data/edgedb/cla";
import { GitHubStatusChecksAPI } from "./service/data/github/checks";
import { GitHubUsersService } from "./service/data/github/users";
import { StatusChecksService } from "./service/domain/checks";
import { UsersService } from "./service/domain/users";
import { ServiceSettings } from "./service/settings";
import { SignClaHandler } from "./service/handlers/sign-cla"
import { ClaCheckHandler } from "./service/handlers/check-cla"
import { TYPES } from "./constants/types";


const container = new Container();

container.bind<ClaRepository>(TYPES.ClaRepository)
  .to(EdgeDBClaRepository).inSingletonScope();

container.bind<StatusChecksService>(TYPES.StatusChecksService)
  .to(GitHubStatusChecksAPI).inSingletonScope();

container.bind<UsersService>(TYPES.UsersService).to(GitHubUsersService);

container.bind<ServiceSettings>(TYPES.ServiceSettings).to(ServiceSettings).inSingletonScope();

container.bind<SignClaHandler>(TYPES.SignClaHandler).to(SignClaHandler);

container.bind<ClaCheckHandler>(TYPES.ClaCheckHandler).to(ClaCheckHandler);

export { container };
