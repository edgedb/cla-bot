import {auth} from "../../../../pages-common/auth";
import {AgreementsHandler} from "../../../../service/handlers/agreements";
import {container} from "../../../../service/di";
import {handleExceptions} from "../..";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../../../constants/types";

const agreementsHandler = container.get<AgreementsHandler>(
  TYPES.AgreementsHandler
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
    case "GET":
      await handleExceptions(res, async () => {
        const data = await agreementsHandler.getAgreement(id);

        if (data === null) {
          return res.status(404).json({
            error: "Agreement not found",
            errorCode: "NotFound",
          });
        }

        res.status(200).json(data);
      });
      return;
    case "PATCH":
      await auth(req, res);

      // update an existing agreement
      await handleExceptions(res, async () => {
        const body = req.body;

        await agreementsHandler.updateAgreement(
          id,
          body.name,
          body.description
        );

        return res.status(204).end();
      });
      return;
  }

  res.status(405).end(`${req.method} not allowed`);
};
