import {NextApiRequest, NextApiResponse} from "next";
import {auth} from "../../../pages-common/auth";
import {container} from "../../../service/di";
import {TYPES} from "../../../constants/types";
import {ClasImportOutput, ClasImportInput} from "../../../service/domain/cla";
import {handleExceptions} from "..";
import {ErrorDetails} from "../../../service/common/web";
import {ClasHandler} from "../../../service/handlers/clas";

const clasHandler = container.get<ClasHandler>(TYPES.ClasHandler);

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ClasImportOutput | ErrorDetails>
) => {
  // TODO: import CLAs into the database;
  // TODO: verify that Agreement ID is valid;
  // TODO: use CONFLICT to handle existing agreements
  await auth(req, res);

  const {method} = req;

  switch (method) {
    case "POST":
      await handleExceptions(res, async () => {
        const data = req.body as ClasImportInput;

        const result = await clasHandler.importClas(data);
        return res.status(200).json(result);
      });
      return;
  }

  res.status(405).end(`${method} not allowed`);
};
