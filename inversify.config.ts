import { ClaRepository } from "./service/domain/cla";
import { Container } from "inversify";
import { EdgeDBClaRepository } from "./service/data/edgedb/cla";
import { GitHubStatusChecksAPI } from "./service/data/github/checks";
import { StatusChecksService } from "./service/domain/checks";
import { TYPES } from "./constants/types";
import "reflect-metadata";



const container = new Container();

container.bind<ClaRepository>(TYPES.ClaRepository).to(EdgeDBClaRepository);
container.bind<StatusChecksService>(TYPES.StatusChecksService).to(GitHubStatusChecksAPI);

export { container };
