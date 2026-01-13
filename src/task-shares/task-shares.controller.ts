// src/task-shares/task-shares.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { TaskSharesService } from './task-shares.service'
import { SharePermission } from '../entities/task-share.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('task-shares')
@UseGuards(JwtAuthGuard)
export class TaskSharesController {
  constructor(
    private readonly taskSharesService: TaskSharesService
  ) { }

  @Get('shared-with-me')
  async findSharedWithMe(@CurrentUser() user: any) {
    return this.taskSharesService.findSharedWithMe(user.id)
  }

  @Get('shared-by-me')
  async findSharedByMe(@CurrentUser() user: any) {
    return this.taskSharesService.findSharedByMe(user.id)
  }

  @Get('task/:taskId')
  async findByTask(@Param('taskId') taskId: string) {
    return this.taskSharesService.findByTask(taskId)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taskSharesService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskShareDto: any, @CurrentUser() user: any) {
    return this.taskSharesService.create({ ...createTaskShareDto, shared_by_user_id: user.id })
  }

  @Patch(':id/permission')
  async updatePermission(@Param('id') id: string, @Body('permission') permission: SharePermission) {
    return this.taskSharesService.updatePermission(id, permission)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.taskSharesService.delete(id)
  }

  @Get('check-permission')
  async checkPermission(@Param('taskId') taskId: string, @CurrentUser() user: any) {
    const hasPermission = await this.taskSharesService.checkPermission(taskId, user.id)
    return { hasPermission }
  }
}
