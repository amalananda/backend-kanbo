import { IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateTaskDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  category_id?: string
}
