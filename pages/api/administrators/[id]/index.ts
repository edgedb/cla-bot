import {container} from "../../../../service/di";
import {TYPES} from "../../../../constants/types";
import {AdministratorsHandler} from "../../../../service/handlers/administrators";
import {createAPIHandler} from "../../../../pages-common/apiHandler";

const administratorsHandler = container.get<AdministratorsHandler>(
  TYPES.AdministratorsHandler
);

export default createAPIHandler({
  DELETE: async (req, res) => {
    const {
      query: {id},
    } = req;

    if (typeof id !== "string") {
      // should never happen by definition
      return res.status(400).end("Invalid object id");
    }

    await administratorsHandler.removeAdministrator(id);
    return res.status(204).end();
  },
});
