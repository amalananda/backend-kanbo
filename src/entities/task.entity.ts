// src/entities/task.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from './user.entity'
import { Category } from './category.entity'
import { TaskTag } from './task-tag.entity'
import { Subtask } from './subtask.entity'
import { TaskShare } from './task-share.entity'

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('tasks')
@Index(['user_id', 'status']) // Composite index untuk filter tasks by user dan status
@Index(['user_id', 'due_date']) // Composite index untuk upcoming tasks
@Index(['user_id', 'category_id']) // Composite index untuk filter by category
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Index() // Index untuk filtering by status
  @Column({
    type: 'enum',
    enum: TaskStatus,
    nullable: false,
    default: TaskStatus.TODO,
  })
  status: TaskStatus

  @Column({ type: 'varchar', length: 50, nullable: false, default: '📝' })
  icon: string

  @Index() // Index untuk filtering by priority
  @Column({
    type: 'enum',
    enum: TaskPriority,
    nullable: false,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  due_date: Date

  @Index() // Index untuk JOIN dengan categories
  @Column({ type: 'uuid', nullable: true })
  category_id: string

  @Index() // Index PENTING untuk filtering tasks by user
  @Column({ type: 'uuid', nullable: false })
  user_id: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date

  // Relations
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Category, (category) => category.tasks, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category

  @OneToMany(() => TaskTag, (taskTag) => taskTag.task)
  task_tags: TaskTag[]

  @OneToMany(() => Subtask, (subtask) => subtask.parent_task)
  subtasks: Subtask[]

  @OneToMany(() => TaskShare, (taskShare) => taskShare.task)
  task_shares: TaskShare[]

}
