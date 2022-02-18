import {AuthContext} from "../../../pages-common/auth";
import {NextApiRequest, NextApiResponse} from "next";
import {createAPIHandler} from "../../../pages-common/apiHandler";

export default createAPIHandler({
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (req as unknown as AuthContext).user;
    res.status(200).json(user);
  },
});
