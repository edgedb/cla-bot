import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./constants/types";
import { ClaRepository } from "./service/domain/cla"
import { StatusChecksService } from "./service/domain/checks"

import { EdgeDBClaRepository } from "./service/data/edgedb/cla"
import { GitHubStatusChecksAPI } from "./service/data/github/checks"


const container = new Container();

container.bind<ClaRepository>(TYPES.ClaRepository).to(EdgeDBClaRepository);
container.bind<StatusChecksService>(TYPES.StatusChecksService).to(GitHubStatusChecksAPI);

export { container };
