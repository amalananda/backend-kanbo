// src/tasks/tasks.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity'
import { TaskShare, SharePermission } from '../entities/task-share.entity'

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskShare)
    private readonly taskShareRepo: Repository<TaskShare>,
  ) { }

  /**
   * Get comprehensive permission info for a task
   */
  private async getTaskPermission(taskId: string, userId: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      select: ['id', 'user_id'],
    })

    if (!task) {
      return {
        hasAccess: false,
        isOwner: false,
        permission: null,
        canView: false,
        canEdit: false,
        canDelete: false,
      }
    }

    // Owner has all permissions
    const isOwner = task.user_id === userId
    if (isOwner) {
      return {
        hasAccess: true,
        isOwner: true,
        permission: SharePermission.ADMIN,
        canView: true,
        canEdit: true,
        canDelete: true,
      }
    }

    // Check if shared with user
    const share = await this.taskShareRepo.findOne({
      where: {
        task_id: taskId,
        shared_with_user_id: userId,
      },
      select: ['id', 'permission'],
    })

    if (!share) {
      return {
        hasAccess: false,
        isOwner: false,
        permission: null,
        canView: false,
        canEdit: false,
        canDelete: false,
      }
    }

    // Determine permissions based on share permission level
    const permission = share.permission
    return {
      hasAccess: true,
      isOwner: false,
      permission,
      canView: true,
      canEdit: permission === SharePermission.EDIT || permission === SharePermission.ADMIN,
      canDelete: permission === SharePermission.ADMIN,
    }
  }

  /**
   * Find all tasks user owns OR has access to via sharing
   */
  async findAll(userId: string, page = 1, limit = 10) {
    const take = Math.min(limit, 50)
    const skip = (page - 1) * take

    // Get tasks user owns
    const [ownedTasks, ownedTotal] = await this.taskRepo.findAndCount({
      where: { user_id: userId },
      relations: ['category'],
      order: { created_at: 'DESC' },
      take,
      skip,
    })

    // Get shared task IDs
    const sharedTaskIds = await this.taskShareRepo
      .createQueryBuilder('share')
      .select('share.task_id')
      .where('share.shared_with_user_id = :userId', { userId })
      .getMany()

    let sharedTasks = []
    if (sharedTaskIds.length > 0) {
      const taskIds = sharedTaskIds.map(s => s.task_id)
      sharedTasks = await this.taskRepo.find({
        where: taskIds.map(id => ({ id })),
        relations: ['category'],
        order: { created_at: 'DESC' },
      })
    }

    // Combine
    const allTasks = [...ownedTasks, ...sharedTasks]
    const total = ownedTotal + sharedTasks.length

    return {
      data: allTasks,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    }
  }

  async findByStatus(userId: string, status: TaskStatus): Promise<Task[]> {
    // Get owned tasks
    const ownedTasks = await this.taskRepo.find({
      where: { user_id: userId, status },
      relations: ['category'],
      order: { created_at: 'DESC' },
    })

    // Get shared task IDs
    const sharedTaskIds = await this.taskShareRepo
      .createQueryBuilder('share')
      .select('share.task_id')
      .where('share.shared_with_user_id = :userId', { userId })
      .getMany()

    let sharedTasks = []
    if (sharedTaskIds.length > 0) {
      const taskIds = sharedTaskIds.map(s => s.task_id)
      sharedTasks = await this.taskRepo.find({
        where: taskIds.map(id => ({ id, status })),
        relations: ['category'],
        order: { created_at: 'DESC' },
      })
    }

    return [...ownedTasks, ...sharedTasks]
  }

  async findByPriority(userId: string, priority: TaskPriority): Promise<Task[]> {
    // Get owned tasks
    const ownedTasks = await this.taskRepo.find({
      where: { user_id: userId, priority },
      relations: ['category'],
      order: { due_date: 'ASC' },
    })

    // Get shared task IDs
    const sharedTaskIds = await this.taskShareRepo
      .createQueryBuilder('share')
      .select('share.task_id')
      .where('share.shared_with_user_id = :userId', { userId })
      .getMany()

    let sharedTasks = []
    if (sharedTaskIds.length > 0) {
      const taskIds = sharedTaskIds.map(s => s.task_id)
      sharedTasks = await this.taskRepo.find({
        where: taskIds.map(id => ({ id, priority })),
        relations: ['category'],
        order: { due_date: 'ASC' },
      })
    }

    return [...ownedTasks, ...sharedTasks]
  }

  async findByCategory(userId: string, categoryId: string): Promise<Task[]> {
    // Get owned tasks
    const ownedTasks = await this.taskRepo.find({
      where: { user_id: userId, category_id: categoryId },
      relations: ['category'],
      order: { created_at: 'DESC' },
    })

    // Get shared task IDs
    const sharedTaskIds = await this.taskShareRepo
      .createQueryBuilder('share')
      .select('share.task_id')
      .where('share.shared_with_user_id = :userId', { userId })
      .getMany()

    let sharedTasks = []
    if (sharedTaskIds.length > 0) {
      const taskIds = sharedTaskIds.map(s => s.task_id)
      sharedTasks = await this.taskRepo.find({
        where: taskIds.map(id => ({ id, category_id: categoryId })),
        relations: ['category'],
        order: { created_at: 'DESC' },
      })
    }

    return [...ownedTasks, ...sharedTasks]
  }

  async findUpcoming(userId: string): Promise<Task[]> {
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    // Get owned tasks
    const ownedTasks = await this.taskRepo
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.due_date >= :now', { now })
      .andWhere('task.due_date <= :nextWeek', { nextWeek })
      .andWhere('task.status != :done', { done: TaskStatus.DONE })
      .leftJoinAndSelect('task.category', 'category')
      .orderBy('task.due_date', 'ASC')
      .getMany()

    // Get shared task IDs
    const sharedTaskIds = await this.taskShareRepo
      .createQueryBuilder('share')
      .select('share.task_id')
      .where('share.shared_with_user_id = :userId', { userId })
      .getMany()

    let sharedTasks = []
    if (sharedTaskIds.length > 0) {
      const taskIds = sharedTaskIds.map(s => s.task_id)
      sharedTasks = await this.taskRepo
        .createQueryBuilder('task')
        .whereInIds(taskIds)
        .andWhere('task.due_date >= :now', { now })
        .andWhere('task.due_date <= :nextWeek', { nextWeek })
        .andWhere('task.status != :done', { done: TaskStatus.DONE })
        .leftJoinAndSelect('task.category', 'category')
        .orderBy('task.due_date', 'ASC')
        .getMany()
    }

    return [...ownedTasks, ...sharedTasks]
  }

  async findOverdue(userId: string): Promise<Task[]> {
    const now = new Date()

    // Get owned tasks
    const ownedTasks = await this.taskRepo
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.due_date < :now', { now })
      .andWhere('task.status != :done', { done: TaskStatus.DONE })
      .andWhere('task.status != :cancelled', { cancelled: TaskStatus.CANCELLED })
      .leftJoinAndSelect('task.category', 'category')
      .orderBy('task.due_date', 'ASC')
      .getMany()

    // Get shared task IDs
    const sharedTaskIds = await this.taskShareRepo
      .createQueryBuilder('share')
      .select('share.task_id')
      .where('share.shared_with_user_id = :userId', { userId })
      .getMany()

    let sharedTasks = []
    if (sharedTaskIds.length > 0) {
      const taskIds = sharedTaskIds.map(s => s.task_id)
      sharedTasks = await this.taskRepo
        .createQueryBuilder('task')
        .whereInIds(taskIds)
        .andWhere('task.due_date < :now', { now })
        .andWhere('task.status != :done', { done: TaskStatus.DONE })
        .andWhere('task.status != :cancelled', { cancelled: TaskStatus.CANCELLED })
        .leftJoinAndSelect('task.category', 'category')
        .orderBy('task.due_date', 'ASC')
        .getMany()
    }

    return [...ownedTasks, ...sharedTasks]
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id, user_id: userId },
      relations: [
        'category',
        'task_tags',
        'task_tags.tag',
        'subtasks',
      ],
    })

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    return task
  }

  async findOneWithAccess(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: [
        'category',
        'task_tags',
        'task_tags.tag',
        'subtasks',
      ]
    })

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    // Check if user owns the task
    if (task.user_id === userId) {
      return task
    }

    // Check if task is shared with user
    const share = await this.taskShareRepo.findOne({
      where: {
        task_id: id,
        shared_with_user_id: userId,
      },
    })

    if (!share) {
      throw new ForbiddenException('You do not have access to this task')
    }

    return task
  }

  async create(createTaskDto: any): Promise<Task> {
    const result = await this.taskRepo.insert(createTaskDto)
    return this.taskRepo.findOneOrFail({
      where: { id: result.identifiers[0].id },
    })
  }

  async update(id: string, userId: string, updateTaskDto: any): Promise<Task> {
    const perm = await this.getTaskPermission(id, userId)

    if (!perm.canEdit) {
      throw new ForbiddenException('You do not have permission to edit this task')
    }

    const task = await this.taskRepo.findOne({
      where: { id },
    })

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    Object.assign(task, updateTaskDto)
    return this.taskRepo.save(task)
  }

  async updateStatus(
    id: string,
    userId: string,
    status: TaskStatus,
  ): Promise<Task> {
    const perm = await this.getTaskPermission(id, userId)

    if (!perm.canEdit) {
      throw new ForbiddenException('You do not have permission to edit this task')
    }

    const task = await this.taskRepo.findOne({
      where: { id },
    })

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    task.status = status
    return this.taskRepo.save(task)
  }

  async delete(id: string, userId: string): Promise<void> {
    const perm = await this.getTaskPermission(id, userId)

    // Only owner or users with ADMIN permission can delete
    if (!perm.canDelete) {
      throw new ForbiddenException('You do not have permission to delete this task')
    }

    const task = await this.taskRepo.findOne({
      where: { id },
    })

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    await this.taskRepo.remove(task)
  }

  async getStats(userId: string) {
    // Get owned tasks stats
    const ownedRawStats = await this.taskRepo
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.user_id = :userId', { userId })
      .groupBy('task.status')
      .getRawMany()

    // Get shared task count
    const sharedTaskIds = await this.taskShareRepo
      .createQueryBuilder('share')
      .select('share.task_id')
      .where('share.shared_with_user_id = :userId', { userId })
      .getMany()

    let sharedStats = {}
    if (sharedTaskIds.length > 0) {
      const taskIds = sharedTaskIds.map(s => s.task_id)
      const sharedRawStats = await this.taskRepo
        .createQueryBuilder('task')
        .select('task.status', 'status')
        .addSelect('COUNT(task.id)', 'count')
        .whereInIds(taskIds)
        .groupBy('task.status')
        .getRawMany()

      sharedRawStats.forEach(row => {
        sharedStats[row.status] = Number(row.count)
      })
    }

    // Combine stats
    const result = { total: 0 }

    for (const row of ownedRawStats) {
      const count = Number(row.count)
      result[row.status] = count
      result.total += count
    }

    // Add shared tasks to stats
    Object.entries(sharedStats).forEach(([status, count]) => {
      result[status] = (result[status] || 0) + Number(count)
      result.total += Number(count)
    })

    return result
  }
}
