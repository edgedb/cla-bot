import { container } from "../../../service/di";
import { License } from "../../../service/domain/licenses";
import { AgreementsHandler } from "../../../service/handlers/licenses";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../constants/types";


const licensesHandler = container.get<AgreementsHandler>(TYPES.LicensesHandler);


export default async (req: NextApiRequest, res: NextApiResponse<License[]>) => {
  const {
    method
  } = req

  switch (method) {
    case "GET":
      // return a list of licenses without details
      const licenses = await licensesHandler.getLicenses()
      res.status(200).json(licenses)

      return
    case "POST":
      // create a new license: require admin authentication and authorization

      res.status(500).end("Not implemented")
      return
  }

  res.status(405).end(`${method} not allowed`)
}
