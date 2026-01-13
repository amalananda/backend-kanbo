// src/users/users.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Public } from '../auth/decorators/public.decorator'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Get()
  async findAll() {
    return this.usersService.findAll()
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getMyStats(@CurrentUser() user: any) {
    return this.usersService.getUserStats(user.id)
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Put('me')
  async update(@Body() updateUserDto: any, @CurrentUser() user: any) {
    return this.usersService.update(user.id, updateUserDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() user: any) {
    return this.usersService.delete(user.id)
  }
}
