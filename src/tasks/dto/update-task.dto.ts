import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator'
import { TaskStatus } from '../../entities/task.entity'

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  category_id?: string

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus
}
