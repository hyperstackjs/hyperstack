import { HyperModel, Schema } from 'hyperstack'
import { User } from './user'
const {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Table,
  Unique,
} = Schema

@Table
class Note extends HyperModel<Partial<Note>> {
  @IsUUID(4)
  @Default(DataType.UUIDV4)
  @AllowNull(false)
  @Unique
  @Column
  pid: string

  @AllowNull(false)
  @Column
  title: string

  @Column
  content: string

  @ForeignKey(() => User)
  @Column
  ownerId: number

  @BelongsTo(() => User)
  owner: User

  static allByOwner(user: User) {
    return Note.findAll({ where: { ownerId: user.id } })
  }

  static oneByOwner(user: User, params: any) {
    return Note.findOne({ where: { ...params, ownerId: user.id } })
  }

  static createWithOwner(
    user: User,
    params: { content?: string; title?: string }
  ) {
    return Note.create({ ...params, ownerId: user.id })
  }

  toJSON() {
    const { content, title, pid } = this.get() as any
    return { content, title, pid }
  }
}
export { Note }
