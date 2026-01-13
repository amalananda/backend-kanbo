// src/categories/categories.controller.ts
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
import { CategoriesService } from './categories.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService) { }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.categoriesService.findAll(user.id)
  }
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.findOne(id, user.id)
  }
  @Get(':id/stats')
  async getCategoryStats(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.getCategoryStats(id, user.id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoriesDto: any, @CurrentUser() user: any) {
    return this.categoriesService.create({ ...createCategoriesDto, user_id: user.id })
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoriesDto: any, @CurrentUser() user: any) {
    return this.categoriesService.update(id, user.id, updateCategoriesDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.delete(id, user.id)
  }
}
