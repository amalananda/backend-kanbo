// src/entities/subtask.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { Task } from './task.entity'

@Entity('subtasks')
@Index(['parent_task_id', 'order_index']) // Composite index untuk sorting subtasks
@Index(['parent_task_id', 'is_completed']) // Composite index untuk filtering completed subtasks
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index() // Index PENTING untuk JOIN dengan tasks
  @Column({ type: 'uuid' })
  parent_task_id: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string

  @Index() // Index untuk filtering completed/uncompleted subtasks
  @Column({ type: 'boolean', nullable: false, default: false })
  is_completed: boolean

  @Index() // Index untuk sorting subtasks
  @Column({ type: 'integer', nullable: false, default: 0 })
  order_index: number

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updated_at: Date

  // Relations
  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_task_id' })
  parent_task: Task
}
