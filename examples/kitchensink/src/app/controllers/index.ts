import Sink from './sink'
import Auth from './auth'
import { NotesController } from './notes'
import { BlogsController } from './blogs'

const controllers = []
controllers.push(Sink)
controllers.push(Auth)
controllers.push(NotesController)
controllers.push(BlogsController)

export const AppController = {
  controllers,
}
