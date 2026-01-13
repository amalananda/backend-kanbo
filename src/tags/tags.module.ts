// src/tags/tags.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TagsController } from './tags.controller'
import { TagsService } from './tags.service'
import { Tag } from '../entities/tag.entity'
import { TaskTag } from '../entities/task-tag.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Tag, TaskTag])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule { }
