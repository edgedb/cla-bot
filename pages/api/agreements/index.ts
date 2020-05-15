import { container } from "../../../service/di";
import { Agreement } from "../../../service/domain/licenses";
import { AgreementsHandler } from "../../../service/handlers/licenses";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../constants/types";


const agreementsHandler = container
  .get<AgreementsHandler>(TYPES.AgreementsHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<Agreement[]>
) => {
  const {
    method
  } = req

  switch (method) {
    case "GET":
      // return a list of licenses without details
      const licenses = await agreementsHandler.getLicenses()
      res.status(200).json(licenses)

      return
    case "POST":
      // create a new license: require admin authentication and authorization

      res.status(500).end("Not implemented")
      return
  }

  res.status(405).end(`${method} not allowed`)
}
