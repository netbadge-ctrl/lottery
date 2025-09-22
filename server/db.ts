import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../services/db/schema';

// 使用外部数据库连接字符串
const connectionString = process.env.EXTERNAL_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "EXTERNAL_DATABASE_URL must be set. Please provide the PostgreSQL connection string.",
  );
}

export const pool = new Pool({ 
  connectionString,
  ssl: false // 禁用SSL连接，因为数据库服务器不支持SSL
});

export const db = drizzle(pool, { schema });
