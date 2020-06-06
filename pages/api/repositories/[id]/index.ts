import {container} from "../../../../service/di";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../../../constants/types";
import {handleExceptions} from "../..";
import {RepositoriesHandler} from "../../../../service/handlers/repositories";
import {auth} from "../../../../pages-common/auth";

const repositoriesHandler = container.get<RepositoriesHandler>(
  TYPES.RepositoriesHandler
);

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const {
    query: {id},
  } = req;

  if (typeof id !== "string") {
    // should never happen by definition
    return res.status(400).end("Invalid object id");
  }

  switch (req.method) {
    case "DELETE":
      await auth(req, res);

      await handleExceptions(res, async () => {
        await repositoriesHandler.deleteRepositoryConfiguration(id);

        return res.status(204).end();
      });
  }

  res.status(405).end(`${req.method} not allowed`);
};
