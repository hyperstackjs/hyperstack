import { Controller, Get, Post, notfound, ok, requires } from 'hyperstack'
import type { Request, Response } from 'hyperstack'
import { getProps } from '@hyperstackjs/initializer-jwt'
import { z } from 'zod'
import { Note } from '../models/note'
const { MustAuthWithJWT, currentUser } = getProps()

const noteSchema = z.object({
  title: z.string().min(1).max(1024),
  content: z
    .string()
    .min(1)
    .max(10 * 1024),
})
const requireNoteParams = requires(noteSchema)
const requireNoteId = requires(z.object({ pid: z.string().min(1).max(256) }))

@Controller('notes')
@MustAuthWithJWT
export class NotesController {
  async getNote(req: Request) {
    const note = await Note.oneByOwner(
      currentUser(req),
      requireNoteId(req.params)
    )
    if (!note) {
      throw notfound('note not found')
    }
    return note
  }

  @Get()
  async list(req: Request, _res: Response) {
    req.logger.info('got all notes')
    const notes = await Note.allByOwner(currentUser(req))
    return ok({ notes })
  }

  @Post()
  async create(req: Request) {
    const note = await Note.createWithOwner(
      currentUser(req),
      requireNoteParams(req.body)
    )
    return ok({ note })
  }

  @Get(':pid')
  async get(req: Request) {
    const note = await this.getNote(req)
    return ok({ note })
  }

  @Post(':pid')
  async update(req: Request) {
    const note = await this.getNote(req)
    await note.update(requireNoteParams(req.body))
    return ok({ note })
  }
}
