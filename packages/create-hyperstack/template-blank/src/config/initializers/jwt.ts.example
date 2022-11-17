import jwt from '@hyperstackjs/initializer-jwt'

export default jwt((context) => async (payload) => {
  const { User } = context.models()
  const user = await User.findOne({ where: { username: payload.sub } })
  if (!user) {
    return null
  }
  return { user }
})
