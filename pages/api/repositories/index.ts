import { container } from "../../../service/di";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../constants/types";
import { RepositoriesHandler } from "../../../service/handlers/repositories";
import { handleExceptions } from "..";


const repositoriesHandler = container
  .get<RepositoriesHandler>(TYPES.RepositoriesHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const {
    method
  } = req

  switch (method) {
    case "GET":
      const repositories = await repositoriesHandler
        .getConfiguredRepositories()
      res.status(200).json(repositories)
      return
    case "POST":
      await handleExceptions(res, async () => {
        const { agreementId, repositoryId } = req.body;

        await repositoriesHandler.createRepositoryConfiguration(
          agreementId,
          repositoryId
        )
        return res.status(204).end()
      });
        return
  }

  res.status(405).end(`${method} not allowed`)
}
