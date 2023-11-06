import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ default: '' })
  displayLanguage: string;

  @Column({ default: '' })
  language: string;

  @Column({ default: '' })
  languages: string;

  @Column({ nullable: true, unique: true })
  root: number;

  @Column({ nullable: true, unique: true })
  sider: number;

  @Column({ nullable: true, unique: true })
  shared: number;
}
