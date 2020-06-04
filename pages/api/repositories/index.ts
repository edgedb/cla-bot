import { container } from "../../../service/di";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../constants/types";
import { RepositoriesHandler } from "../../../service/handlers/repositories";
import { handleExceptions } from "..";
import { auth } from "../../../pages-common/auth";


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
      await auth(req, res);

      await handleExceptions(res, async () => {
        const { agreementId, repositoryFullName } = req.body;

        await repositoriesHandler.createRepositoryConfiguration(
          agreementId,
          repositoryFullName
        )
        return res.status(204).end()
      });
        return
  }

  res.status(405).end(`${method} not allowed`)
}
