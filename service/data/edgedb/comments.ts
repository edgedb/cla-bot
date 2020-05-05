import { CommentInfo, CommentsRepository } from "../../domain/comments";
import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";


@injectable()
export class EdgeDBCommentsRepository extends EdgeDBRepository implements CommentsRepository {

  async getCommentInfoByPullRequestId(pullRequestId: number): Promise<CommentInfo | null> {
    let items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `select CommentInfo {
          comment_id,
          created_at
        } filter .pull_request_id = <int64>$0 limit 1;`,
        [pullRequestId]
      );
    })

    if (items.length) {
      const item = items[0];
      return {
        id: item.id,
        comment_id: item.comment_id,
        pullRequestId,
        createdAt: item.created_at
      };
    }

    return null;
  }

  async storeCommentInfo(
    commentId: string,
    pullRequestId: number,
    createdAt: Date
  ): Promise<void> {
    await this.run(async connection => {
      await connection.fetchAll(
        `
        INSERT CommentInfo {
          comment_id := <str>$comment_id,
          pull_request_id := <int64>$pull_request_id,
          created_at := <datetime>$created_at
        }
        `,
        {
          comment_id: commentId,
          pull_request_id: pullRequestId,
          created_at: createdAt
        }
      )
    });
  }
}
