// src/subtasks/subtasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { SubtasksService } from './subtasks.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('subtasks')
@UseGuards(JwtAuthGuard)
export class SubtasksController {
  constructor(
    private readonly subtasksService: SubtasksService) { }

  @Get('task/:taskId')
  async findByTask(@Param('taskId') taskId: string) {
    return this.subtasksService.findByTask(taskId)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subtasksService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSubtaskDto: any) {
    return this.subtasksService.create(createSubtaskDto)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSubtaskDto: any) {
    return this.subtasksService.update(id, updateSubtaskDto)
  }

  @Patch(':id/toggle')
  async toggleComplete(@Param('id') id: string) {
    return this.subtasksService.toggleComplete(id)
  }

  @Put('task/:taskId/reorder')
  async reorder(@Param('taskId') taskId: string, @Body('subtaskIds') subtaskIds: string[]) {
    return this.subtasksService.reorder(taskId, subtaskIds)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.subtasksService.delete(id)
  }
}
