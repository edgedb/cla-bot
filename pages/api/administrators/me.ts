import {auth} from "../../../pages-common/auth";
import {handleExceptions} from "..";
import {NextApiRequest, NextApiResponse} from "next";


export default async (req: NextApiRequest, res: NextApiResponse) => {
  await handleExceptions(res, async () => {
    const user = await auth(req, res);
    res.status(200).json(user);
  });
};
