// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      select: ['id', 'email', 'username', 'full_name', 'avatar_url', 'created_at', 'updated_at'],
    })
  }
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'username', 'full_name', 'avatar_url', 'created_at', 'updated_at'],
    })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } })
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } })
  }
  async create(createUserDto: {
    email: string
    username: string
    password: string
    full_name?: string
    avatar_url?: string
  }): Promise<User> {
    // Check for existing email
    const existingEmail = await this.findByEmail(createUserDto.email)
    if (existingEmail) {
      throw new ConflictException('Email already in use')
    }
    // Check for existing username
    const existingUsername = await this.findByUsername(createUserDto.username)
    if (existingUsername) {
      throw new ConflictException('Username already in use')
    }
    // Hash password
    const password_hash = await bcrypt.hash(createUserDto.password, 10)
    const newUser = this.userRepo.create({
      ...createUserDto,
      password_hash,
    })
    const savedUser = await this.userRepo.save(newUser)
    // Remove password_hash from response
    delete savedUser.password_hash
    return savedUser
  }

  async update(id: string, updateUserDto: {
    email?: string
    username?: string
    password?: string
    full_name?: string
    avatar_url?: string
  }): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    // Check email conflict
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.findByEmail(updateUserDto.email)
      if (existingEmail) {
        throw new ConflictException('Email already in use')
      }
    }
    // Check username conflict
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.findByUsername(updateUserDto.username)
      if (existingUsername) {
        throw new ConflictException('Username already in use')
      }
    }
    // Hash new password if provided
    if (updateUserDto.password) {
      user.password_hash = await bcrypt.hash(updateUserDto.password, 10)
    }
    Object.assign(user, {
      email: updateUserDto.email ?? user.email,
      username: updateUserDto.username ?? user.username,
      full_name: updateUserDto.full_name ?? user.full_name,
      avatar_url: updateUserDto.avatar_url ?? user.avatar_url,
    })
    const savedUser = await this.userRepo.save(user)
    delete savedUser.password_hash
    return savedUser
  }
  async delete(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    await this.userRepo.remove(user)
  }
  async getUserStats(userId: string) {
    const user = await this.findOne(userId)
    const stats = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.tasks', 'task')
      .leftJoin('user.categories', 'category')
      .leftJoin('user.tags', 'tag')
      .where('user.id = :userId', { userId })
      .select([
        'COUNT(DISTINCT task.id) as task_count',
        'COUNT(DISTINCT category.id) as category_count',
        'COUNT(DISTINCT tag.id) as tag_count',
      ])
      .getRawOne()
    return {
      user,
      stats: {
        tasks: parseInt(stats.task_count) || 0,
        categories: parseInt(stats.category_count) || 0,
        tags: parseInt(stats.tag_count) || 0,
      },
    }
  }
  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password_hash') // Penting: Include password_hash untuk login
      .where('user.email = :identifier', { identifier })
      .orWhere('user.username = :identifier', { identifier })
      .getOne()
  }
}
