// src/tasks/tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TaskStatus, TaskPriority } from '../entities/task.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService) { }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.tasksService.findAll(
      user.id,
      Number(page),
      Number(limit),
    )
  }

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    return this.tasksService.getStats(user.id)
  }

  @Get('upcoming')
  async findUpcoming(@CurrentUser() user: any) {
    return this.tasksService.findUpcoming(user.id)
  }
  @Get('overdue')
  async findOverdue(@CurrentUser() user: any) {
    return this.tasksService.findOverdue(user.id)
  }
  @Get('status/:status')
  async findByStatus(@Param('status') status: TaskStatus, @CurrentUser() user: any) {
    return this.tasksService.findByStatus(user.id, status)
  }
  @Get('priority/:priority')
  async findByPriority(@Param('priority') priority: TaskPriority, @CurrentUser() user: any) {
    return this.tasksService.findByPriority(user.id, priority)
  }
  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string, @CurrentUser() user: any) {
    return this.tasksService.findByCategory(user.id, categoryId)
  }
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.findOne(id, user.id)
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.create({ ...createTaskDto, user_id: user.id })
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.update(id, user.id, updateTaskDto)
  }
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus, @CurrentUser() user: any) {
    return this.tasksService.updateStatus(id, user.id, status)
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.delete(id, user.id)
  }
}
