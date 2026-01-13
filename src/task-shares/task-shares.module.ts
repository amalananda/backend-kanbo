// src/task-shares/task-shares.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TaskSharesController } from './task-shares.controller'
import { TaskSharesService } from './task-shares.service'
import { TaskShare } from '../entities/task-share.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TaskShare])],
  controllers: [TaskSharesController],
  providers: [TaskSharesService],
  exports: [TaskSharesService],
})
export class TaskSharesModule { }
