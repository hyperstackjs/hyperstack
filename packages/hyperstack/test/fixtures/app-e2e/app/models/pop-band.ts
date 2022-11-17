import { HyperModel, Schema } from '../../../../../src'
const { AllowNull, Column, IsEmail, Table } = Schema

@Table
class PopBand extends HyperModel<PopBand> {
  @Column
  frontman?: string

  @AllowNull(false)
  @IsEmail
  @Column
  email?: string

  toJSON() {
    const { frontman } = this.get() as any
    return { frontman }
  }
}
export { PopBand }
