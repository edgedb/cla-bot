
// TODO: support
export enum CheckState {
  success = "success",
  failure = "failure",
}

export class StatusCheckInput {
  state: CheckState
  targetUrl: string
  description: string
  context: string

  constructor(
    state: CheckState,
    targetUrl: string,
    description: string,
    context: string
  ) {
    this.state = state
    this.targetUrl = targetUrl
    this.description = description
    this.context = context
  }
}


export interface StatusChecksService {

  createStatus(data: StatusCheckInput): Promise<void>;

}
