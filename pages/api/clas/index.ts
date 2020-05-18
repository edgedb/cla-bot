import { container } from "../../../service/di";
import { AgreementListItem } from "../../../service/domain/agreements";
import { AgreementsHandler } from "../../../service/handlers/agreements";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../constants/types";


const agreementsHandler = container
  .get<AgreementsHandler>(TYPES.AgreementsHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<AgreementListItem[]>
) => {
  const {
    method
  } = req

  switch (method) {
    case "GET":
      // return a list of licenses without details
      const licenses = await agreementsHandler.getAgreements()
      res.status(200).json(licenses)

      return
  }

  res.status(405).end(`${method} not allowed`)
}
