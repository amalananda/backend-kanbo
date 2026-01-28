// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { Task } from '../entities/task.entity'
import { Subtask } from '../entities/subtask.entity'
import { TaskTag } from '../entities/task-tag.entity'
import { TaskShare } from 'src/entities'

@Module({
  imports: [TypeOrmModule.forFeature([Task, Subtask, TaskTag, TaskShare])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule { }
