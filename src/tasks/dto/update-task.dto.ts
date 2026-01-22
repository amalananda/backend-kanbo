// src/tasks/dto/update-task.dto.ts
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator'
import { TaskStatus, TaskPriority } from '../../entities/task.entity'

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string

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
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsOptional()
  @IsDateString()
  due_date?: string

  @IsOptional()
  @IsUUID()
  category_id?: string
}
