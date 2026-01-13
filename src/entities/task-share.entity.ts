// src/entities/task-share.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { Task } from './task.entity'
import { User } from './user.entity'

export enum SharePermission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN',
}

@Entity('task_shares')
@Index(['task_id', 'shared_with_user_id']) // Composite index untuk lookup sharing
@Index(['shared_with_user_id', 'permission']) // Composite index untuk filtering shared tasks
export class TaskShare {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index() // Index PENTING untuk JOIN dengan tasks
  @Column({ type: 'uuid' })
  task_id: string

  @Index() // Index PENTING untuk filtering tasks shared dengan user tertentu
  @Column({ type: 'uuid' })
  shared_with_user_id: string

  @Index() // Index untuk filtering by permission level
  @Column({
    type: 'enum',
    enum: SharePermission,
    default: SharePermission.VIEW,
  })
  permission: SharePermission

  @Index() // Index untuk tracking siapa yang share
  @Column({ type: 'uuid', nullable: false })
  shared_by_user_id: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  // Relations
  @ManyToOne(() => Task, (task) => task.task_shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task

  @ManyToOne(() => User, (user) => user.shared_tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_with_user_id' })
  shared_with_user: User

  @ManyToOne(() => User, (user) => user.shared_by_me, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_by_user_id' })
  shared_by_user: User
}
