// src/entities/category.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from './user.entity'
import { TaskTag } from './task-tag.entity'

@Entity('tags')
@Index(['user_id', 'name'])
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string

  @Column({ type: 'varchar', length: 7, nullable: false, default: '#6B7280' })
  color: string

  @Index() // Index penting untuk filtering tags by user
  @Column({ type: 'uuid', nullable: false })
  user_id: string

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date

  // Relations
  @ManyToOne(() => User, (user) => user.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToMany(() => TaskTag, (taskTag) => taskTag.tag)
  task_tags: TaskTag[]
}
