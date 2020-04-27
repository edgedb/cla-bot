import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./constants/types";
import { ClaRepository } from "./service/domain/repositories"
import { EdgeDBClaRepository } from "./service/data/edgedb/cla"

const container = new Container();

container.bind<ClaRepository>(TYPES.ClaRepository).to(EdgeDBClaRepository);

export { container };
