// src/app.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

// Controllers
import { AppController } from './app.controller'

// Modules
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TasksModule } from './tasks/tasks.module'
import { CategoriesModule } from './categories/categories.module'
import { TagsModule } from './tags/tags.module'
import { SubtasksModule } from './subtasks/subtasks.module'
import { TaskSharesModule } from './task-shares/task-shares.module'

// Guards
import { JwtAuthGuard } from './auth/jwt-auth.guard'

// Entities
import {
  User,
  Task,
  Category,
  Tag,
  TaskTag,
  Subtask,
  TaskShare,
} from './entities'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: Number(configService.get('DB_PORT', 5432)),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE', 'taskboard_db'),
        entities: [User, Task, Category, Tag, TaskTag, Subtask, TaskShare],
        synchronize: false, // Use migrations
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // For AppController health check
    TypeOrmModule.forFeature([User, Task, Category]),

    // Feature Modules
    AuthModule, // ✅ Add Auth Module
    UsersModule,
    TasksModule,
    CategoriesModule,
    TagsModule,
    SubtasksModule,
    TaskSharesModule,
  ],
  controllers: [AppController],
  providers: [
    // ✅ Global Auth Guard - Protect all routes by default
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})

export class AppModule { }
