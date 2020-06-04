import { auth } from "../../../../pages-common/auth";
import { container } from "../../../../service/di";
import { AgreementsHandler } from "../../../../service/handlers/agreements";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../../constants/types";
import { handleExceptions } from "../..";


const agreementsHandler = container
  .get<AgreementsHandler>(TYPES.AgreementsHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  await auth(req, res);

  const { query: { id }} = req;

  if (typeof id !== "string") {
    // should never happen by definition
    return res.status(400).end("Invalid object id");
  }

  switch (req.method) {
    case "POST":
      // updates the text of an existing agreement version
      // id is a version id;
      await handleExceptions(res, async () => {
        await agreementsHandler.makeAgreementVersionCurrent(id)
        return res.status(204).end()
      });
  }

  res.status(405).end(`${req.method} not allowed`)
}
