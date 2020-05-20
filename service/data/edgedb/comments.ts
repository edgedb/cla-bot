import { CommentInfo, CommentsRepository } from "../../domain/comments";
import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";


@injectable()
export class EdgeDBCommentsRepository
extends EdgeDBRepository implements CommentsRepository {

  async getCommentInfoByPullRequestId(
    pullRequestId: number
  ): Promise<CommentInfo | null> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT CommentInfo {
          comment_id,
          creation_time
        } FILTER .pull_request_id = <int64>$0 limit 1;`,
        [pullRequestId]
      );
    })

    if (items.length) {
      const item = items[0];
      return {
        id: item.id,
        commentId: item.comment_id,
        pullRequestId,
        createdAt: item.creation_time
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
          creation_time := <datetime>$creation_time
        }
        `,
        {
          comment_id: commentId,
          pull_request_id: pullRequestId,
          creation_time: createdAt
        }
      )
    });
  }
}
