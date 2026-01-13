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
import { Task } from './task.entity'

@Entity('categories')
@Index(['user_id', 'name'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string

  @Column({ type: 'varchar', length: 7, nullable: false, default: '#3B82F6' })
  color: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string

  @Index() // Index penting untuk filtering categories by user
  @Column({ type: 'uuid', nullable: false })
  user_id: string

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date

  // Relations
  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToMany(() => Task, (task) => task.category)
  tasks: Task[]
}
