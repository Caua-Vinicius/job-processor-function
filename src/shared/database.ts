import * as mongoose from "mongoose";
import { JobSchema } from "./schemas/job.schema";
let conn: mongoose.Connection = null;

export async function connectToDatabase() {
  if (conn == null) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL não está definida.");
    }

    conn = mongoose.createConnection(databaseUrl, {
      serverSelectionTimeoutMS: 5000,
    });

    await conn.asPromise();

    conn.model("Job", JobSchema);
  }

  return conn;
}
