import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";
import { AdministratorsRepository, Administrator } from "../../domain/administrators";


@injectable()
export class EdgeDBAdministratorsRepository
  extends EdgeDBRepository implements AdministratorsRepository {

  async getAdministrators(): Promise<Administrator[]> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Administrator {
          id,
          email
        };`
      );
    })

    return items.map(entity => new Administrator(
      entity.id,
      entity.email
    ));
  }

  async getAdministratorByEmail(
    email: string
  ): Promise<Administrator | null> {
    const items = await this.run(async (connection) => {
      return await connection.fetchAll(
        `SELECT Administrator {
          id,
          email
        } FILTER .email = <str>$email LIMIT 1;`, {
          email
        }
      );
    })

    if (!items.length) {
      return null;
    }

    const singleItem = items[0];

    return new Administrator(
      singleItem.id,
      singleItem.email
    );
  }

  async addAdministrator(email: string): Promise<void> {
    await this.run(async connection => {
      await connection.fetchAll(
        `
        INSERT Administrator {
          email := <str>$email
        }
        `,
        {
          email
        }
      )
    });
  }

  async removeAdministrator(id: string): Promise<void> {
    await this.run(async connection => {
      await connection.fetchOne(
        `
        DELETE Administrator FILTER .id = <uuid>$id
        `,
        {
          id
        }
      )
    });
  }

}
