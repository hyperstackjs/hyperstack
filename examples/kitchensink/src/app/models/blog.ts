import { HyperModel, Schema } from 'hyperstack'
const { AllowNull, Column, Table } = Schema

@Table
class Blog extends HyperModel<Partial<Blog>> {
  @Column
  content: string

  @AllowNull(false)
  @Column
  title: string

  toJSON() {
    const { content, title } = this.get() as any
    return { content, title }
  }
}
export { Blog }
