import { container } from "../../service/di";
import { AgreementListItem } from "../../service/domain/agreements";
import { AgreementsHandler } from "../../service/handlers/agreements";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../constants/types";
import { SafeError, ErrorDetails } from "../../service/common/web";


const agreementsHandler = container
  .get<AgreementsHandler>(TYPES.AgreementsHandler);


// TODO: make decorator, or put in a common place (like Express.js middleware)
// having this function here is a temporary solution
async function handleExceptions<T>(
  res: NextApiResponse<T | ErrorDetails>,
  action: () => Promise<void>
): Promise<void> {
  try {
    await action()
  } catch (error) {

    if (error instanceof SafeError) {
      // handled error: the service is behaving as desired
      res.status(error.statusCode).json(error.getObject());
      return;
    }

    throw error;
  }
}


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
        const data = JSON.parse(req.body);
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
