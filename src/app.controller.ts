// src/app.controller.ts
import { Controller, Get } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { Task } from './entities/task.entity'
import { Category } from './entities/category.entity'
import { Public } from './auth/decorators/public.decorator'

@Controller()
export class AppController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>
  ) { }

  @Public() // ✅ Make this endpoint public
  @Get()
  getRoot() {
    return {
      name: 'Kanbo API Server',
      version: '1.0.0',
      status: 'running',
      description: 'Task Management API with JWT Authentication',
      auth: {
        login: 'POST /auth/login',
        register: 'POST /auth/register',
        profile: 'GET /auth/profile (requires token)',
      },
      endpoints: {
        users: '/users (partial auth)',
        tasks: '/tasks (requires auth)',
        categories: '/categories (requires auth)',
        tags: '/tags (requires auth)',
        subtasks: '/subtasks (requires auth)',
        'task-shares': '/task-shares (requires auth)',
        health: '/health',
        docs: '/api/docs',
      },
    }
  }

  @Public() // ✅ Make this endpoint public
  @Get('health')
  async healthCheck() {
    try {
      const [userCount, taskCount, categoryCount] = await Promise.all([
        this.userRepo.count(),
        this.taskRepo.count(),
        this.categoryRepo.count(),
      ])

      return {
        status: 'OK',
        database: 'Connected',
        timestamp: new Date().toISOString(),
        counts: {
          users: userCount,
          tasks: taskCount,
          categories: categoryCount,
        },
      }
    } catch (error) {
      return {
        status: 'ERROR',
        database: 'Disconnected',
        timestamp: new Date().toISOString(),
        error: error.message,
      }
    }
  }

  @Public()
  @Get('api/docs')
  getApiDocs() {
    return {
      name: 'Kanbo API Documentation',
      version: '1.0.0',
      baseUrl: 'http://localhost:3001',
      authentication: {
        'POST /auth/register': 'Register new user',
        'POST /auth/login': 'Login and get JWT token',
        'GET /auth/profile': 'Get current user profile (requires auth)',
        'GET /auth/me': 'Get current user info (requires auth)',
      },
      authorization: {
        note: 'Most endpoints require JWT token',
        header: 'Authorization: Bearer <token>',
        public_endpoints: ['/', '/health', '/api/docs', '/auth/*', 'GET /users', 'GET /users/:id'],
        protected_endpoints: 'All /tasks, /categories, /tags, /subtasks, /task-shares endpoints',
      },
      endpoints: {
        auth: {
          'POST /auth/register': 'Register new user',
          'POST /auth/login': 'Login with username/password',
          'GET /auth/profile': 'Get user profile',
          'GET /auth/me': 'Get current user info',
        },
        users: {
          'GET /users': 'Get all users (public)',
          'GET /users/:id': 'Get user by ID (public)',
          'GET /users/me': 'Get my profile (auth required)',
          'GET /users/me/stats': 'Get my statistics (auth required)',
          'PUT /users/me': 'Update my profile (auth required)',
          'DELETE /users/me': 'Delete my account (auth required)',
        },
        tasks: {
          'GET /tasks': 'Get my tasks (auth required)',
          'GET /tasks/stats': 'Get my task statistics',
          'GET /tasks/upcoming': 'Get my upcoming tasks',
          'GET /tasks/overdue': 'Get my overdue tasks',
          'GET /tasks/status/:status': 'Get my tasks by status',
          'GET /tasks/priority/:priority': 'Get my tasks by priority',
          'GET /tasks/category/:categoryId': 'Get my tasks by category',
          'GET /tasks/:id': 'Get my task by ID',
          'POST /tasks': 'Create new task',
          'PUT /tasks/:id': 'Update my task',
          'PATCH /tasks/:id/status': 'Update task status',
          'DELETE /tasks/:id': 'Delete my task',
        },
        categories: {
          'GET /categories': 'Get my categories',
          'GET /categories/:id': 'Get my category by ID',
          'GET /categories/:id/stats': 'Get category statistics',
          'POST /categories': 'Create new category',
          'PUT /categories/:id': 'Update my category',
          'DELETE /categories/:id': 'Delete my category',
        },
        tags: {
          'GET /tags': 'Get my tags',
          'GET /tags/:id': 'Get my tag by ID',
          'POST /tags': 'Create new tag',
          'PUT /tags/:id': 'Update my tag',
          'DELETE /tags/:id': 'Delete my tag',
          'POST /tags/tasks/:taskId/tags/:tagId': 'Add tag to task',
          'DELETE /tags/tasks/:taskId/tags/:tagId': 'Remove tag from task',
        },
        subtasks: {
          'GET /subtasks/task/:taskId': 'Get subtasks for task',
          'GET /subtasks/:id': 'Get subtask by ID',
          'POST /subtasks': 'Create new subtask',
          'PUT /subtasks/:id': 'Update subtask',
          'PATCH /subtasks/:id/toggle': 'Toggle subtask completion',
          'PUT /subtasks/task/:taskId/reorder': 'Reorder subtasks',
          'DELETE /subtasks/:id': 'Delete subtask',
        },
        taskShares: {
          'GET /task-shares/shared-with-me': 'Get tasks shared with me',
          'GET /task-shares/shared-by-me': 'Get tasks I shared',
          'GET /task-shares/task/:taskId': 'Get shares for task',
          'GET /task-shares/:id': 'Get share by ID',
          'POST /task-shares': 'Share task with user',
          'PATCH /task-shares/:id/permission': 'Update share permission',
          'DELETE /task-shares/:id': 'Remove share',
          'GET /task-shares/check-permission/:taskId': 'Check my permission',
        },
      },
      enums: {
        TaskStatus: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
        TaskPriority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        SharePermission: ['VIEW', 'EDIT', 'ADMIN'],
      },
    }
  }
}
