// import { container } from "../../inversify.config"
// import { TYPES } from "../../constants/types"
// import { ClaRepository } from "../../service/domain/repositories"
import { EdgeDBClaRepository } from "../../service/data/edgedb/cla"


async function checkCLA(gitHubUserId: Number): Promise<void> {
  // check if the requester signed the CLA
  const claRepository = new EdgeDBClaRepository();
  // TODO: how to fix the following error?
  // Support for the experimental syntax 'decorators-legacy' isn't currently enabled
  //
  // container.get<ClaRepository>(TYPES.ClaRepository);

  const cla = await claRepository.getClaByGitHubUserId(gitHubUserId);

  if (cla == null) {
    // TODO: post a failure status, requiring to sign the CLA
  } else {
    // TODO: post a success status
  }
}

export { checkCLA };
