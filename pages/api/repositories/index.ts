import { container } from "../../../service/di";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../constants/types";
import { RepositoriesHandler } from "../../../service/handlers/repositories";
import { RepositoryInfo } from "../../../service/domain/repositories";


const repositoriesHandler = container
  .get<RepositoriesHandler>(TYPES.RepositoriesHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<RepositoryInfo[]>
) => {
  const {
    method
  } = req

  switch (method) {
    case "GET":
      const repositories = await repositoriesHandler
        .getAvailableRepositories("edgedb", 1)
      res.status(200).json(repositories)
      return
  }

  res.status(405).end(`${method} not allowed`)
}
