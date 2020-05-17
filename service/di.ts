// ATTENTION: the import of "reflect-metadata" must happen before inversify,
// otherwise inversify doesn't work - so don't sort imports here...
import "reflect-metadata";
import { ClaCheckHandler } from "./handlers/check-cla";
import { Container } from "inversify";
import { ServiceSettings } from "./settings";
import { SignClaHandler } from "./handlers/sign-cla";
import { TYPES } from "../constants/types";
import { TokensHandler } from "./handlers/tokens";
import { AgreementsHandler } from "./handlers/licenses";
import { registerEdgeDBRepositories } from "./data/edgedb/di";
import { registerGitHubServices } from "./data/github/di";
import { RepositoriesHandler } from "./handlers/repositories";


const container = new Container();

registerEdgeDBRepositories(container);

registerGitHubServices(container);

container.bind<ServiceSettings>(TYPES.ServiceSettings)
  .toConstantValue(new ServiceSettings());

container.bind<SignClaHandler>(TYPES.SignClaHandler)
  .to(SignClaHandler);

container.bind<ClaCheckHandler>(TYPES.ClaCheckHandler)
  .to(ClaCheckHandler);

container.bind<AgreementsHandler>(TYPES.AgreementsHandler)
  .to(AgreementsHandler);

container.bind<TokensHandler>(TYPES.TokensHandler)
  .to(TokensHandler);

container.bind<RepositoriesHandler>(TYPES.RepositoriesHandler)
  .to(RepositoriesHandler);

export { container };
