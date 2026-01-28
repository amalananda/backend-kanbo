// src/task-shares/task-shares.service.ts
import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SharePermission, TaskShare } from '../entities/task-share.entity'
import { Task } from '../entities/task.entity'

@Injectable()
export class TaskSharesService {
  constructor(
    @InjectRepository(TaskShare)
    private taskShareRepo: Repository<TaskShare>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

  ) { }

  async findSharedWithMe(userId: string): Promise<TaskShare[]> {
    return this.taskShareRepo.find({
      where: { shared_with_user_id: userId },
      relations: ['task', 'task.category', 'shared_by_user'],
      order: { created_at: 'DESC' }
    })
  }

  async findSharedByMe(userId: string) {
    return this.taskShareRepo.find({
      where: { shared_by_user_id: userId },
      relations: ['task', 'task.category', 'shared_with_user'],
      order: { created_at: 'DESC' }
    })
  }

  async findByTask(taskId: string, userId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } })
    if (!task) throw new NotFoundException('Task not found')

    if (task.user_id !== userId) {
      throw new ForbiddenException('Only owner can see shares')
    }

    return this.taskShareRepo.find({
      where: { task_id: taskId },
      relations: ['shared_with_user'],
    })
  }

  async findOne(id: string, userId: string) {
    const share = await this.taskShareRepo.findOne({ where: { id } })
    if (!share) throw new NotFoundException('Share not found')

    if (share.shared_by_user_id !== userId) {
      throw new ForbiddenException('Only owner can access share')
    }

    return share
  }

  async create(dto: any, ownerId: string) {
    const task = await this.taskRepo.findOne({ where: { id: dto.task_id } })
    if (!task) throw new NotFoundException('Task not found')

    if (task.user_id !== ownerId) {
      throw new ForbiddenException('Only owner can share task')
    }

    const exists = await this.taskShareRepo.findOne({
      where: {
        task_id: dto.task_id,
        shared_with_user_id: dto.shared_with_user_id,
      },
    })

    if (exists) throw new ConflictException('Task already shared')

    return this.taskShareRepo.save(
      this.taskShareRepo.create({
        ...dto,
        shared_by_user_id: ownerId,
      }),
    )
  }

  async updatePermission(id: string, permission: SharePermission, userId: string) {
    const share = await this.findOne(id, userId)

    share.permission = permission
    return this.taskShareRepo.save(share)
  }
  async delete(id: string, userId: string) {
    const share = await this.taskShareRepo.findOne({ where: { id } })
    if (!share) throw new NotFoundException('Share not found')

    // ❗ PENTING: user yang di-share TIDAK BOLEH hapus share
    if (share.shared_by_user_id !== userId) {
      throw new ForbiddenException('Only owner can remove share')
    }

    await this.taskShareRepo.remove(share)
  }

  async checkPermission(taskId: string, userId: string) {
    const share = await this.taskShareRepo.findOne({
      where: { task_id: taskId, shared_with_user_id: userId },
    })

    return share?.permission ?? null
  }
}
