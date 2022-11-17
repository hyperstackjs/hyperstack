import { Controller, Get, Post, err, ok, requires, unauthorized } from 'hyperstack'
import type { Request, Response } from 'hyperstack'
import { z } from 'zod'
import { User } from '../models/user'
import { AuthMailer } from '@/app/mailers/auth'

const routes = {
  forgot: Post('forgot'), // decorators can also be fiddled with like this
}
const passwordSchema = z.string().min(5)
const usernameSchema = z.object({
  username: z.string().min(3).email(),
})
const loginSchema = usernameSchema.extend({
  password: passwordSchema,
})
const registerSchema = loginSchema.extend({
  name: z.string().min(2),
})

const requireUsernameSchema = requires(usernameSchema)
const requireLoginParams = requires(loginSchema)
const requireRegisterParams = requires(registerSchema)
const requireVerifyToken = requires(
  z.object({ verifyToken: z.string().min(0).max(128) })
)
const requireResetParams = requires(
  z.object({ resetToken: z.string().min(0).max(128), password: passwordSchema })
)

@Controller('auth')
export default class Auth {
  @Post('login')
  async login(req: Request) {
    const { username, password } = requireLoginParams(req.body)
    const user = await User.findOne({ where: { username } })
    if (!user) {
      throw unauthorized('incorrect username or password')
    }
    if (!(await user.verifyPassword(password))) {
      throw unauthorized('incorrect username or password')
    }

    return ok({ token: user.createAuthenticationToken() })
  }

  @Post('register')
  async register(req: Request, _res: Response) {
    const { username, password, name } = requireRegisterParams(req.body)
    const user = await User.createWithPassword({
      username,
      password,
      name,
      isEmailVerified: false,
    })

    await AuthMailer.sendWelcome(user).deliverLater()

    return ok({ token: user.createAuthenticationToken() })
  }

  @Get('verify')
  async verify(req: Request) {
    const { verifyToken: emailVerificationToken } = requireVerifyToken(
      req.query
    )
    if (!emailVerificationToken) {
      throw err('missing verify token')
    }
    const user = await User.findOne({
      where: { emailVerificationToken },
    })
    if (!user) {
      throw err('missing, illegal, or expired verify token')
    }
    await user.verified()

    return ok({ ok: true })
  }

  @routes.forgot
  async forgot(req: Request) {
    const { username } = requireUsernameSchema(req.body)
    const user = await User.findOne({ where: { username } })
    if (!user) {
      throw unauthorized('incorrect username or password')
    }
    await user.forgotPassword()
    await AuthMailer.forgotPassword(user).deliverLater()

    return ok({ ok: true })
  }

  @Post('reset')
  async reset(req: Request) {
    const { resetToken, password } = requireResetParams(req.body)
    if (!resetToken) {
      throw err('missing reset token')
    }
    const user = await User.findOne({
      where: { resetToken },
    })
    if (!user) {
      throw err('missing, illegal, or expired reset token')
    }
    await user.resetPassword(password)

    return ok({ ok: true })
  }
}
