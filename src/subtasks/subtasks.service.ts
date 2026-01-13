// src/subtasks/subtasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Subtask } from '../entities/subtask.entity'

@Injectable()
export class SubtasksService {
  constructor(
    @InjectRepository(Subtask)
    private readonly subtaskRepo: Repository<Subtask>,
  ) { }

  async findByTask(taskId: string): Promise<Subtask[]> {
    return this.subtaskRepo.find({
      where: { parent_task_id: taskId },
      order: { created_at: 'ASC' }
    })
  }
  async findOne(id: string): Promise<Subtask> {
    const subtask = await this.subtaskRepo.findOne({ where: { id } })
    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${id} not found`)
    }
    return subtask
  }

  async create(createSubtaskDto: {
    parent_task_id: string,
    title: string,
    order_index?: number,
  }): Promise<Subtask> {
    const newSubtask = this.subtaskRepo.create(createSubtaskDto)
    return this.subtaskRepo.save(newSubtask)
  }

  async update(id: string, updateSubtaskDto: any): Promise<Subtask> {
    const subtask = await this.findOne(id)
    Object.assign(subtask, updateSubtaskDto)
    return this.subtaskRepo.save(subtask)
  }

  async toggleComplete(id: string): Promise<Subtask> {
    const subtask = await this.findOne(id)
    subtask.is_completed = !subtask.is_completed
    return this.subtaskRepo.save(subtask)
  }

  async reorder(taskId: string, subtaskIds: string[]) {
    await Promise.all(
      subtaskIds.map((id, index) =>
        this.subtaskRepo.update(
          { id, parent_task_id: taskId },
          { order_index: index }
        )
      )
    )
  }

  async delete(id: string): Promise<void> {
    const subtask = await this.findOne(id)
    await this.subtaskRepo.remove(subtask)
  }
}
