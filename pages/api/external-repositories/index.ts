import {container} from "../../../service/di";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../../constants/types";
import {RepositoriesHandler} from "../../../service/handlers/repositories";
import {ExternalRepository} from "../../../service/domain/repositories";

const repositoriesHandler = container.get<RepositoriesHandler>(
  TYPES.RepositoriesHandler
);

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ExternalRepository[]>
) => {
  const {method} = req;

  switch (method) {
    case "GET":
      const repositories = await repositoriesHandler
        .getAvailableRepositories();
      res.status(200).json(repositories);
      return;
  }

  res.status(405).end(`${method} not allowed`);
};
