import { ConnectionOptions, createConnection } from "https://deno.land/x/typeorm/mod.ts";
import { Order } from "../models/Order.ts";

const connectionOptions: ConnectionOptions = {
  type: "postgres",
  host: Deno.env.get("DB_HOST") || "",
  port: Number(Deno.env.get("DB_PORT")) || 5432,
  username: Deno.env.get("DB_USER") || "",
  password: Deno.env.get("DB_PASSWORD") || "",
  database: Deno.env.get("DB_NAME") || "",
  entities: [Order],
  synchronize: true,
};

const connection = await createConnection(connectionOptions);

export default connection;
