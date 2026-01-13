// src/database/data-source.ts
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
// ✅ Hapus .ts extension dari semua imports
import { User } from '../entities/user.entity'
import { Task } from '../entities/task.entity'
import { Category } from '../entities/category.entity'
import { Tag } from '../entities/tag.entity'
import { TaskTag } from '../entities/task-tag.entity'
import { Subtask } from '../entities/subtask.entity'
import { TaskShare } from '../entities/task-share.entity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_DATABASE || 'taskboard_db',
  entities: [User, Task, Category, Tag, TaskTag, Subtask, TaskShare],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
})
