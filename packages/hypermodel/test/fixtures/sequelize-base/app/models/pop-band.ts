import { AllowNull, Column, IsEmail, Table } from 'sequelize-typescript'
import { HyperModel } from '../../../../../src/index'

@Table
class PopBand extends HyperModel<PopBand> {
  @Column
  frontman: string

  @AllowNull(false)
  @IsEmail
  @Column
  email: string

  defineAbilities({ can }: any) {
    can('rock', 'World')
  }

  toJSON() {
    const { frontman } = this.get() as any
    return { frontman }
  }
}
export { PopBand }
