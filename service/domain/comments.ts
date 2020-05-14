

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

  updateComment(
    targetAccountId: number,
    targetRepoFullName: string,
    commentId: string,
    body: string
  ): Promise<void>
}


export interface CommentInfo {
  id: string
  commentId: string
  pullRequestId: number
  createdAt: Date
}


export interface CommentsRepository {

  getCommentInfoByPullRequestId(
    pullRequestId: number
  ): Promise<CommentInfo | null>;

  storeCommentInfo(
    commentId: string,
    pullRequestId: number,
    createdAt: Date
  ): Promise<void>
}
