import {container} from "../../../service/di";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../../constants/types";
import {handleExceptions} from "..";
import {ClasHandler} from "../../../service/handlers/clas";
import {auth} from "../../../pages-common/auth";

const clasHandler = container.get<ClasHandler>(TYPES.ClasHandler);

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  await auth(req, res);

  const {
    query: {email},
  } = req;

  if (typeof email !== "string") {
    // should never happen by definition
    return res.status(400).end("Invalid email id");
  }

  switch (req.method) {
    case "GET":
      await handleExceptions(res, async () => {
        const data = await clasHandler.getClaByEmail(email);

        if (!data) {
          return res.status(404).end("Object not found.");
        }

        return res.status(200).json(data);
      });

      break;
    default:
      res.status(405).end(`${req.method} not allowed`);
      break;
  }
};
