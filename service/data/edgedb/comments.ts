import { CommentInfo, CommentsRepository } from "../../domain/comments";
import { injectable } from "inversify";


@injectable()
export class EdgeDBCommentsRepository implements CommentsRepository {

  async getCommentInfoByPullRequestId(pullRequestId: number): Promise<CommentInfo | null> {
    return null;
  }

  async storeCommentInfo(
    commentId: string,
    pullRequestId: number,
    createdAt: Date
  ): Promise<void> {
    // throw new Error("Method not implemented.");
  }

}
