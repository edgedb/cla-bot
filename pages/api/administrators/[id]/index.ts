import { container } from "../../../../service/di";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../../constants/types";
import { AdministratorsHandler } from "../../../../service/handlers/administrators";
import { handleExceptions } from "../../";


const administratorsHandler = container
  .get<AdministratorsHandler>(TYPES.AdministratorsHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const { query: { id }} = req;

  if (typeof id !== "string") {
    // should never happen by definition
    return res.status(400).end("Invalid object id");
  }

  const {
    method
  } = req

  switch (method) {
    case "DELETE":
      await handleExceptions(res, async () => {
        await administratorsHandler.removeAdministrator(
          id
        )
        return res.status(204).end()
      });
      return
  }

  res.status(405).end(`${method} not allowed`)
}
