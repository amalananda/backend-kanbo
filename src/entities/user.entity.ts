// src/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm'
import { Task } from './task.entity'
import { Category } from './category.entity'
import { Tag } from './tag.entity'
import { TaskShare } from './task-share.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string

  @Index()
  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  username: string

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  password_hash: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  full_name: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_url: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date

  // Relations
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[]

  @OneToMany(() => Category, (category: Category) => category.user)
  categories: Category[]

  @OneToMany(() => Tag, (tag: Tag) => tag.user)
  tags: Tag[]

  @OneToMany(() => TaskShare, (taskShare) => taskShare.shared_with_user)
  shared_tasks: TaskShare[]

  @OneToMany(() => TaskShare, (taskShare) => taskShare.shared_by_user)
  shared_by_me: TaskShare[]
}
