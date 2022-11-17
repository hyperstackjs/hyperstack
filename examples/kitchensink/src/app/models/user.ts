import {
  HyperModel,
  HyperModelError,
  Schema,
  generateHexToken,
  hashPassword,
  verifyPassword,
} from 'hyperstack'
import { getProps } from '@hyperstackjs/initializer-jwt'
import { Note } from './note'
const {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  IsEmail,
  IsUUID,
  Table,
  Unique,
} = Schema
const { signJWT } = getProps()

@Table
class User extends HyperModel<Partial<User>> {
  @IsUUID(4)
  @Default(DataType.UUIDV4)
  @AllowNull(false)
  @Unique
  @Column
  pid: string

  @IsEmail
  @Unique
  @AllowNull(false)
  @Column
  username: string

  @AllowNull(false)
  @Column
  password: string

  @AllowNull(false)
  @Column
  name: string

  // <email verification>
  @AllowNull(true)
  @Column
  emailVerificationToken?: string

  @AllowNull(true)
  @Column
  emailVerificationSentAt?: Date

  @AllowNull(true)
  @Column
  emailVerifiedAt?: Date
  // </email verification>

  // <reset password>
  @Column
  resetToken?: string

  @Column
  resetSentAt?: Date
  // </reset password>

  @HasMany(() => Note)
  notes: Note[]

  async verifyPassword(password: string) {
    return verifyPassword(password, this.password)
  }

  static async createWithPassword(
    {
      username,
      password,
      name,
      isEmailVerified = false,
    }: {
      username: string
      password: string
      name: string
      isEmailVerified?: boolean
    },
    opts?: any
  ) {
    if (await User.exists({ where: { username }, ...opts })) {
      throw new HyperModelError('user exists')
    }
    const hashed = await hashPassword(password)

    const user = await User.create(
      {
        username,
        password: hashed,
        name: name.trim(),
        emailVerificationToken: generateHexToken(32),
        emailVerificationSentAt: new Date(),
        emailVerifiedAt: isEmailVerified ? new Date() : null,
      },
      { opts, returning: true }
    )
    return user
  }

  async forgotPassword() {
    await this.update({
      resetToken: generateHexToken(32),
      resetSentAt: new Date(),
    })
  }

  async verified() {
    await this.update({
      emailVerificationToken: null,
      emailVerificationSentAt: null,
      emailVerifiedAt: new Date(),
    })
  }

  async resetPassword(password: string) {
    if (password.length < 6) {
      throw new HyperModelError('password too short')
    }
    const hashed = await hashPassword(password)
    await this.update({
      password: hashed,
      resetToken: null,
      resetSentAt: null,
    })
  }

  createAuthenticationToken(provider = { kind: 'local' }) {
    return signJWT({
      sub: this.username,
      provider,
    })
  }

  toJSON() {
    const { pid, username, name } = this.get() as any
    return { pid, username, name }
  }
}
export { User }
