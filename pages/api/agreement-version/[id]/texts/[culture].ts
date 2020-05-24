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
      handleExceptions(res, async () => {
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

      return
    case "PUT":
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

      return
  }

  res.status(405).end(`${req.method} not allowed`)
}
