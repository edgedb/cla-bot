import { container } from "../../service/di";
import { AgreementListItem } from "../../service/domain/agreements";
import { AgreementsHandler } from "../../service/handlers/agreements";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../constants/types";
import { SafeError, ErrorDetails } from "../../service/common/web";
import { handleExceptions } from ".";


const agreementsHandler = container
  .get<AgreementsHandler>(TYPES.AgreementsHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<AgreementListItem | AgreementListItem[] | ErrorDetails>
) => {
  const {
    method
  } = req

  switch (method) {
    case "GET":
      // return a list of licenses without details
      const agreements = await agreementsHandler.getAgreements()
      res.status(200).json(agreements)
      return

    case "POST":
      // create a new license: require admin authentication and authorization
      await handleExceptions(res, async () => {
        const data = req.body;
        const result = await agreementsHandler.createAgreement(
          data.name,
          data.description
        )

        res.status(201).json(result);
      });

      return
  }

  res.status(405).end(`${method} not allowed`)
}
