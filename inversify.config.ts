import "reflect-metadata";
import { ClaRepository } from "./service/domain/cla";
import { Container } from "inversify";
import { EdgeDBClaRepository } from "./service/data/edgedb/cla";
import { GitHubStatusChecksAPI } from "./service/data/github/checks";
import { StatusChecksService } from "./service/domain/checks";
import { ServiceSettings } from "./service/settings";
import { TYPES } from "./constants/types";


const container = new Container();

container.bind<ClaRepository>(TYPES.ClaRepository).to(EdgeDBClaRepository);
container.bind<StatusChecksService>(TYPES.StatusChecksService).to(GitHubStatusChecksAPI);
container.bind<ServiceSettings>(ServiceSettings).toSelf();

export { container };
