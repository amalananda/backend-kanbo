// src/task-shares/task-shares.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TaskSharesController } from './task-shares.controller'
import { TaskSharesService } from './task-shares.service'
import { TaskShare } from '../entities/task-share.entity'
import { Task } from 'src/entities'

@Module({
  imports: [TypeOrmModule.forFeature([TaskShare, Task])],
  controllers: [TaskSharesController],
  providers: [TaskSharesService],
  exports: [TaskSharesService],
})
export class TaskSharesModule { }
