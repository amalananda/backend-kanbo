// src/tags/tags.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tag } from '../entities/tag.entity'
import { TaskTag } from '../entities/task-tag.entity'

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(TaskTag)
    private readonly taskTagRepo: Repository<TaskTag>,
  ) { }

  async findAll(userId: string): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { user_id: userId },
      relations: ['task_tags'],
      order: { created_at: 'DESC' }
    })
  }
  async findOne(id: string, userId: string): Promise<Tag> {
    const tag = await this.tagRepo.findOne({
      where: { id, user_id: userId },
      relations: ['task_tags'],
    })
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`)
    }
    return tag
  }
  async create(createTagDto: {
    name: string
    color?: string
    user_id: string
  }): Promise<Tag> {
    const existingTag = await this.tagRepo.findOne({
      where: { name: createTagDto.name, user_id: createTagDto.user_id },
    })
    if (existingTag) {
      throw new ConflictException('Tag with this name already exists')
    }
    const newTag = this.tagRepo.create(createTagDto)
    return this.tagRepo.save(newTag)
  }

  async update(id: string, userId: string, updateTagDto: any): Promise<Tag> {
    const tag = await this.findOne(id, userId)
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepo.findOne({
        where: { name: updateTagDto.name, user_id: userId },
      })
      if (existingTag) {
        throw new ConflictException('Tag with this name already exists')
      }
    }
    Object.assign(tag, updateTagDto)
    return this.tagRepo.save(tag)
  }

  async delete(id: string, userId: string): Promise<void> {
    const tag = await this.findOne(id, userId)
    await this.tagRepo.remove(tag)
  }

  async addTagToTask(taskId: string, tagId: string): Promise<TaskTag> {
    const existing = await this.taskTagRepo.findOne({
      where: { task_id: taskId, tag_id: tagId },
    })

    if (existing) {
      throw new ConflictException('Tag already added to this task')
    }

    const taskTag = this.taskTagRepo.create({ task_id: taskId, tag_id: tagId })
    return this.taskTagRepo.save(taskTag)
  }

  async removeTagFromTask(taskId: string, tagId: string): Promise<void> {
    const taskTag = await this.taskTagRepo.findOne({
      where: { task_id: taskId, tag_id: tagId },
    })
    if (!taskTag) {
      throw new NotFoundException('Tag not found on this task')
    }
    await this.taskTagRepo.remove(taskTag)
  }
}
