// src/task-shares/task-shares.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SharePermission, TaskShare } from '../entities/task-share.entity'

@Injectable()
export class TaskSharesService {
  constructor(
    @InjectRepository(TaskShare)
    private taskShareRepo: Repository<TaskShare>,
  ) { }

  async findSharedWithMe(userId: string): Promise<TaskShare[]> {
    return this.taskShareRepo.find({
      where: { shared_with_user_id: userId },
      relations: ['task', 'task.category', 'shared_by_user'],
      order: { created_at: 'DESC' }
    })
  }

  async findSharedByMe(userId: string): Promise<TaskShare[]> {
    return this.taskShareRepo.find({
      where: { shared_by_user_id: userId },
      relations: ['task', 'shared_with_user'],
      order: { created_at: 'DESC' }
    })
  }

  async findByTask(taskId: string): Promise<TaskShare[]> {
    return this.taskShareRepo.find({
      where: { task_id: taskId },
      relations: ['shared_with_user', 'shared_by_user'],
    })
  }

  async findOne(id: string): Promise<TaskShare> {
    const taskShare = await this.taskShareRepo.findOne({
      where: { id },
      relations: ['task', 'shared_with_user', 'shared_by_user']
    })
    if (!taskShare) {
      throw new Error(`Task Share with ID ${id} not found`)
    }
    return taskShare
  }

  async create(createTaskShareDto: {
    task_id: string,
    shared_with_user_id: string,
    shared_by_user_id: string,
    permission?: SharePermission
  }): Promise<TaskShare> {
    const existing = await this.taskShareRepo.findOne({
      where: {
        task_id: createTaskShareDto.task_id,
        shared_with_user_id: createTaskShareDto.shared_with_user_id
      },
    })
    if (existing) {
      throw new Error(`Task is already shared with this user`)
    }
    const newTaskShare = this.taskShareRepo.create(createTaskShareDto)
    return this.taskShareRepo.save(newTaskShare)
  }

  async updatePermission(id: string, permission: SharePermission): Promise<TaskShare> {
    const taskShare = await this.findOne(id)
    taskShare.permission = permission
    return this.taskShareRepo.save(taskShare)
  }

  async delete(id: string): Promise<void> {
    const taskShare = await this.findOne(id)
    await this.taskShareRepo.remove(taskShare)
  }

  async checkPermission(taskId: string, userId: string): Promise<SharePermission | null> {
    const taskShare = await this.taskShareRepo.findOne({
      where: {
        task_id: taskId,
        shared_with_user_id: userId
      }
    })
    return taskShare ? taskShare.permission : null
  }
}
