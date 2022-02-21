import {NextApiRequest, NextApiResponse} from "next";
import {container} from "../../service/di";
import {TYPES} from "../../constants/types";
import {ServiceSettings} from "../../service/settings";
import {createAPIHandler} from "../../pages-common/apiHandler";

const settings = container.get<ServiceSettings>(TYPES.ServiceSettings);

interface Metadata {
  organizationName: string;
  organizationDisplayName: string;
}

export default createAPIHandler({
  GET: {
    handler: async (req, res: NextApiResponse<Metadata>) => {
      res.status(200).json({
        organizationName: settings.organizationName,
        organizationDisplayName: settings.organizationDisplayName,
      });
    },
    noAuth: true,
  },
});
