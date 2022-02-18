import {AgreementsHandler} from "../../../../service/handlers/agreements";
import {container} from "../../../../service/di";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../../../constants/types";
import {createAPIHandler} from "../../../../pages-common/apiHandler";

const agreementsHandler = container.get<AgreementsHandler>(
  TYPES.AgreementsHandler
);

export default createAPIHandler({
  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    const {
      query: {id},
    } = req;

    if (typeof id !== "string") {
      // should never happen by definition
      return res.status(400).end("Invalid object id");
    }

    // updates the text of an existing agreement version
    // id is a version id;
    const newAgreement = await agreementsHandler.cloneAgreementVersion(id);
    return res.status(200).json(newAgreement);
  },
});
