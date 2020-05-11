import { Container } from "inversify";
import { ClaRepository } from "../../domain/cla";
import { EdgeDBClaRepository } from "./cla";
import { CommentsRepository } from "../../domain/comments";
import { TYPES } from "../../../constants/types";
import { EdgeDBCommentsRepository } from "./comments";
import { LicensesRepository } from "../../domain/licenses";
import { EdgeDBLicensesRepository } from "./licenses";


export function registerEdgeDBRepositories(container: Container) {

  container.bind<ClaRepository>(TYPES.ClaRepository)
    .to(EdgeDBClaRepository).inSingletonScope();

  container.bind<CommentsRepository>(TYPES.CommentsRepository)
    .to(EdgeDBCommentsRepository).inSingletonScope();

  container.bind<LicensesRepository>(TYPES.LicensesRepository)
    .to(EdgeDBLicensesRepository).inSingletonScope();
}