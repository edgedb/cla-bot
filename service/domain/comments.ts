

export interface Comment {
  id: string
  body: string
}


export interface CommentsService {
  createComment(
    targetAccountId: number,
    targetRepoFullName: string,
    issueId: number,
    body: string
  ): Promise<string>

  getComment(id: string): Promise<Comment>

  updateComment(id: string, text: string): Promise<void>
}
