import { Container } from "inversify";
import { ClaRepository } from "../../domain/cla";
import { EdgeDBClaRepository } from "./cla";
import { CommentsRepository } from "../../domain/comments";
import { TYPES } from "../../../constants/types";
import { EdgeDBCommentsRepository } from "./comments";
import { AgreementsRepository } from "../../domain/licenses";
import { EdgeDBAgreementsRepository } from "./agreements";
import { RepositoriesRepository } from "../../domain/repositories";
import { EdgeDBRepositoriesRepository } from "./repositories";


export function registerEdgeDBRepositories(container: Container): void {

  container.bind<ClaRepository>(TYPES.ClaRepository)
    .to(EdgeDBClaRepository).inSingletonScope();

  container.bind<CommentsRepository>(TYPES.CommentsRepository)
    .to(EdgeDBCommentsRepository).inSingletonScope();

  container.bind<AgreementsRepository>(TYPES.AgreementsRepository)
    .to(EdgeDBAgreementsRepository).inSingletonScope();

  container.bind<RepositoriesRepository>(TYPES.RepositoriesRepository)
    .to(EdgeDBRepositoriesRepository).inSingletonScope();
}
