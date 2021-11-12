import {Client, createClient} from "edgedb";

const client = createClient();

export async function getClient(): Promise<Client> {
  return client.ensureConnected();
}
