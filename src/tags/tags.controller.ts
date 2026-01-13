// src/tags/tags.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { TagsService } from './tags.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(
    private readonly tagsService: TagsService
  ) { }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.tagsService.findAll(user.id)
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tagsService.findOne(id, user.id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTagDto: any, @CurrentUser() user: any) {
    return this.tagsService.create({ ...createTagDto, user_id: user.id })
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTagDto: any, @CurrentUser() user: any) {
    return this.tagsService.update(id, user.id, updateTagDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tagsService.delete(id, user.id)
  }

  @Post('tasks/:taskId/tags/:tagId')
  @HttpCode(HttpStatus.CREATED)
  async addTagToTask(
    @Param('taskId') taskId: string,
    @Param('tagId') tagId: string
  ) {
    return this.tagsService.addTagToTask(taskId, tagId)
  }

  @Delete('tasks/:taskId/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTagFromTask(
    @Param('taskId') taskId: string,
    @Param('tagId') tagId: string
  ) {
    return this.tagsService.removeTagFromTask(taskId, tagId)
  }
}
