// src/tasks/dto/create-task.dto.ts
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator'
import { TaskPriority } from '../../entities/task.entity'

export class CreateTaskDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @IsOptional()
  @IsDateString()
  due_date?: string

  @IsOptional()
  @IsUUID()
  category_id?: string
}
