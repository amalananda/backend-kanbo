// src/categories/categories.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../entities/category.entity'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) { }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { user_id: userId },
      relations: ['tasks'],
      order: { created_at: 'DESC' }
    })
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, user_id: userId },
      relations: ['tasks'],
    })
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }
    return category
  }

  async create(createCategoryDto: {
    name: string
    color?: string
    icon?: string
    user_id: string
  }): Promise<Category> {
    const existingCategory = await this.categoryRepo.findOne({
      where: { name: createCategoryDto.name, user_id: createCategoryDto.user_id },
    })
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists')
    }
    const newCategory = this.categoryRepo.create(createCategoryDto)
    return this.categoryRepo.save(newCategory)
  }

  async update(id: string, userId: string, updateCategoryDto: any): Promise<Category> {
    const category = await this.findOne(id, userId)
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepo.findOne({
        where: { name: updateCategoryDto.name, user_id: userId },
      })
      if (existingCategory) {
        throw new ConflictException('Category with this name already exists')
      }
    }
    Object.assign(category, updateCategoryDto)
    return this.categoryRepo.save(category)
  }

  async delete(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId)
    await this.categoryRepo.remove(category)
  }

  async getCategoryStats(id: string, userId: string) {
    const category = await this.findOne(id, userId)
    const stats = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.tasks', 'task')
      .where('category.id = :id', { id })
      .select([
        'COUNT(task.id) as task_count',
        'COUNT(CASE WHEN task.status = \'DONE\' THEN 1 END) as completed_task',
        'COUNT(CASE WHEN task.status = \'TODO\' THEN 1 END) as todo_task',
      ])
      .getRawOne()
    return {
      category,
      stats: {
        total: parseInt(stats.task_count) || 0,
        completed: parseInt(stats.completed_task) || 0,
        todo: parseInt(stats.todo_task) || 0,
      }
    }
  }
}
