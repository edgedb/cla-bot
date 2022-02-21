import {container} from "../../service/di";
import {AgreementListItem} from "../../service/domain/agreements";
import {AgreementsHandler} from "../../service/handlers/agreements";
import {NextApiRequest, NextApiResponse} from "next";
import {TYPES} from "../../constants/types";
import {createAPIHandler} from "../../pages-common/apiHandler";

const agreementsHandler = container.get<AgreementsHandler>(
  TYPES.AgreementsHandler
);

export default createAPIHandler({
  GET: {
    noAuth: true,
    handler: async (
      req: NextApiRequest,
      res: NextApiResponse<AgreementListItem[]>
    ) => {
      const {filter} = req.query;
      const agreements = await agreementsHandler.getAgreements(
        filter ? filter.toString() : undefined
      );
      res.status(200).json(agreements);
    },
  },
  POST: async (
    req: NextApiRequest,
    res: NextApiResponse<AgreementListItem>
  ) => {
    const data = req.body;
    const result = await agreementsHandler.createAgreement(
      data.name,
      data.description
    );

    res.status(201).json(result);
  },
});
