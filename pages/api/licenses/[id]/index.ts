import { container } from "../../../../service/di";
import { License } from "../../../../service/domain/licenses";
import { LicensesHandler } from "../../../../service/handlers/licenses";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../../constants/types";


const licensesHandler = container.get<LicensesHandler>(TYPES.LicensesHandler);


// TODO: create a middleware to require authentication?
// Or a common method.


export default async (req: NextApiRequest, res: NextApiResponse<License | void>) => {
  const { query: { id }} = req;
  // https://nextjs.org/docs/api-routes/dynamic-api-routes

  if (typeof id != "string") {
    // should never happen by definition
    return res.status(400).end("Invalid object id");
  }

  switch (req.method) {
    case "GET":
      // TODO: add request context with the user who is doing the action
      const data = await licensesHandler.getLicenseDetails(id)

      if (!data) {
        return res.status(404).end("License not found.")
      }

      return res.status(200).json(data)
    case "POST":
      // TODO: create a new license
      break
    case "PATCH":
      // update an existing license
      break
    case "DELETE":
      break
  }

  res.status(405).end(`${req.method} not allowed`)
}