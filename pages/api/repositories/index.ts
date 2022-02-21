import {container} from "../../../service/di";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../../constants/types";
import {RepositoriesHandler} from "../../../service/handlers/repositories";
import {Repository} from "../../../service/domain/repositories";
import {createAPIHandler} from "../../../pages-common/apiHandler";

const repositoriesHandler = container.get<RepositoriesHandler>(
  TYPES.RepositoriesHandler
);

export default createAPIHandler({
  GET: {
    noAuth: true,
    handler: async (
      req: NextApiRequest,
      res: NextApiResponse<Repository[]>
    ) => {
      const repositories =
        await repositoriesHandler.getConfiguredRepositories();
      res.status(200).json(repositories);
    },
  },
  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    const {agreementId, repositoryFullName} = req.body;

    await repositoriesHandler.createRepositoryConfiguration(
      agreementId,
      repositoryFullName
    );

    res.status(204).end();
  },
});
