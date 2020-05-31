import { container } from "../../../service/di";
import { NextApiRequest, NextApiResponse } from "next";
import { TYPES } from "../../../constants/types";
import { AdministratorsHandler } from "../../../service/handlers/administrators";
import { handleExceptions } from "..";


const administratorsHandler = container
  .get<AdministratorsHandler>(TYPES.AdministratorsHandler);


export default async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const {
    method
  } = req

  switch (method) {
    case "GET":
      const items = await administratorsHandler.getAdministrators()
      res.status(200).json(items)
      return
    case "POST":
      await handleExceptions(res, async () => {
        const { email } = req.body;

        await administratorsHandler.addAdministrator(
          email
        )
        return res.status(204).end()
      });
      return
  }

  res.status(405).end(`${method} not allowed`)
}
