import {container} from "../../../../service/di";
import {AgreementVersion} from "../../../../service/domain/agreements";
import {AgreementsHandler} from "../../../../service/handlers/agreements";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../../../constants/types";
import {ErrorDetails} from "../../../../service/common/web";
import {createAPIHandler} from "../../../../pages-common/apiHandler";

const agreementsHandler = container.get<AgreementsHandler>(
  TYPES.AgreementsHandler
);

export default createAPIHandler({
  GET: {
    noAuth: true,
    handler: async (
      req: NextApiRequest,
      res: NextApiResponse<AgreementVersion | ErrorDetails | void>
    ) => {
      const {
        query: {id},
      } = req;

      if (typeof id !== "string") {
        // should never happen by definition
        return res.status(400).end("Invalid object id");
      }

      const data = await agreementsHandler.getAgreementVersion(id);

      if (!data) {
        return res.status(404).end("Agreement version not found.");
      }

      res.status(200).json(data);
    },
  },
});
