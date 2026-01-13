// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByIdentifier(loginDto.identifier)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // validate password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }
    // generate JWT token
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email
    }
    const access_token = this.jwtService.sign(payload)
    return {
      access_token, user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      }
    }
  }


  async register(registerDto: RegisterDto) {
    const existingUserByEmail = await this.usersService.findByEmail(registerDto.email)
    if (existingUserByEmail) {
      throw new ConflictException('Email already in use')
    }
    const existingUserByUsername = await this.usersService.findByUsername(registerDto.username)
    if (existingUserByUsername) {
      throw new ConflictException('Username already in use')
    }
    const user = await this.usersService.create(registerDto)
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email
    }
    const access_token = this.jwtService.sign(payload)
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      }
    }
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username)
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const { password_hash, ...result } = user
      return result
    }
    return null
  }
  async getProfile(userId: string) {
    return this.usersService.findOne(userId)
  }

}
