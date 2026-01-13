// src/tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity'

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) { }

  async findAll(userId: string, page = 1, limit = 10) {
    const take = Math.min(limit, 50)
    const skip = (page - 1) * take

    const [data, total] = await this.taskRepo.findAndCount({
      where: { user_id: userId },
      relations: ['category'],
      order: { created_at: 'DESC' },
      take,
      skip,
    })
    return {
      data,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    }
  }

  async findByStatus(userId: string, status: TaskStatus): Promise<Task[]> {
    return this.taskRepo.find({
      where: { user_id: userId, status },
      relations: ['category'],
      order: { created_at: 'DESC' },
    })
  }

  async findByPriority(userId: string, priority: TaskPriority): Promise<Task[]> {
    return this.taskRepo.find({
      where: { user_id: userId, priority },
      relations: ['category'],
      order: { due_date: 'ASC' },
    })
  }

  async findByCategory(userId: string, categoryId: string): Promise<Task[]> {
    return this.taskRepo.find({
      where: { user_id: userId, category_id: categoryId },
      relations: ['category'],
      order: { created_at: 'DESC' },
    })
  }

  async findUpcoming(userId: string): Promise<Task[]> {
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    return this.taskRepo
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.due_date >= :now', { now })
      .andWhere('task.due_date <= :nextWeek', { nextWeek })
      .andWhere('task.status != :done', { done: TaskStatus.DONE })
      .leftJoinAndSelect('task.category', 'category')
      .orderBy('task.due_date', 'ASC')
      .getMany()
  }

  async findOverdue(userId: string): Promise<Task[]> {
    const now = new Date()

    return this.taskRepo
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.due_date < :now', { now })
      .andWhere('task.status != :done', { done: TaskStatus.DONE })
      .andWhere('task.status != :cancelled', { cancelled: TaskStatus.CANCELLED })
      .leftJoinAndSelect('task.category', 'category')
      .orderBy('task.due_date', 'ASC')
      .getMany()
  }


  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id, user_id: userId },
      relations: [
        'category',
        'task_tags',
        'task_tags.tag',
        'subtasks',
        'task_shares',
        'task_shares.shared_with_user',
      ],
    })

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
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
    const task = await this.findOne(id, userId)
    Object.assign(task, updateTaskDto)
    return this.taskRepo.save(task)
  }

  async updateStatus(
    id: string,
    userId: string,
    status: TaskStatus,
  ): Promise<Task> {
    const task = await this.findOne(id, userId)
    task.status = status
    return this.taskRepo.save(task)
  }

  async delete(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId)
    await this.taskRepo.remove(task)
  }


  async getStats(userId: string) {
    const rawStats = await this.taskRepo
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.user_id = :userId', { userId })
      .groupBy('task.status')
      .getRawMany()

    const result = { total: 0 }

    for (const row of rawStats) {
      const count = Number(row.count)
      result[row.status] = count
      result.total += count
    }

    return result
  }
}
