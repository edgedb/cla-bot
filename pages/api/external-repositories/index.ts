import {container} from "../../../service/di";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../../constants/types";
import {RepositoriesHandler} from "../../../service/handlers/repositories";
import {ExternalRepository} from "../../../service/domain/repositories";
import {createAPIHandler} from "../../../pages-common/apiHandler";

const repositoriesHandler = container.get<RepositoriesHandler>(
  TYPES.RepositoriesHandler
);

export default createAPIHandler({
  GET: {
    noAuth: true,
    handler: async (
      req: NextApiRequest,
      res: NextApiResponse<ExternalRepository[]>
    ) => {
      const repositories =
        await repositoriesHandler.getAvailableRepositories();
      res.status(200).json(repositories);
    },
  },
});
