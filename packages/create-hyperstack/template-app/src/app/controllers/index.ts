// naming and imports: name and import as you see fit
import Auth from './auth'
import { NotesController } from './notes'

const controllers = []
controllers.push(Auth)
controllers.push(NotesController)

export const AppController = {
  controllers,
}
