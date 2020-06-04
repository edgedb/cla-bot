import { auth } from "../../../../../pages-common/auth";
import { container } from "../../../../../service/di";
import { AgreementsHandler } from "../../../../../service/handlers/agreements";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../../../constants/types";
import { handleExceptions } from "../../../";


const agreementsHandler = container
  .get<AgreementsHandler>(TYPES.AgreementsHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const { query: { id, culture }} = req;

  if (typeof id !== "string") {
    // should never happen by definition
    return res.status(400).end("Invalid object id");
  }

  if (typeof culture !== "string") {
    // should never happen by definition
    return res.status(400).end("Invalid culture code");
  }

  switch (req.method) {
    case "GET":
      await handleExceptions(res, async () => {
        const data = await agreementsHandler
        .getAgreementTextByVersionIdAndCulture(
          id,
          culture
        )

        if (!data) {
          return res.status(404).end("Agreement text not found.")
        }

        return res.status(200).json(data)
      })

      break;
    case "PUT":
      await auth(req, res);

      // inserts or updates the text of an existing agreement version
      // by id and culture: id is a version id
      await handleExceptions(res, async () => {
        const body = req.body;

        await agreementsHandler.updateAgreementTextByVersionIdAndCulture(
          id,
          culture,
          body.title,
          body.text
        )
        return res.status(204).end()
      });

      break;
    default:
      res.status(405).end(`${req.method} not allowed`)
      break;
  }
}
