// src/entities/task-tag.entity.ts
import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { Task } from './task.entity'
import { Tag } from './tag.entity'

@Entity('task_tags')
@Index(['task_id']) // Index untuk JOIN dengan tasks
@Index(['tag_id']) // Index untuk JOIN dengan tags
@Index(['task_id', 'tag_id'], { unique: true }) // Composite index untuk lookup cepat
export class TaskTag {
  @PrimaryColumn({ type: 'uuid' })
  task_id: string

  @PrimaryColumn({ type: 'uuid' })
  tag_id: string

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date

  // Relations

  @ManyToOne(() => Task, (task) => task.task_tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task

  @ManyToOne(() => Tag, (tag) => tag.task_tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag
}
