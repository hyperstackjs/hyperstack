import { Controller, Get, Post, notfound, ok, requires } from 'hyperstack'
import type { Request } from 'hyperstack'
import { z } from 'zod'
import { Blog } from '../models/blog'

const requireBlogParams = requires(
  z.object({
    title: z.string(),
    content: z.string(),
  })
)
const requirePostId = requires(z.object({ id: z.string() }))

@Controller('blogs')
export class BlogsController {
  async getBlog(req: Request) {
    const blog = await Blog.findOne({ where: requirePostId(req.params) })
    if (!blog) {
      throw notfound('blog not found')
    }
    return blog
  }

  @Get()
  async list() {
    const blogs = await Blog.findAll()
    return ok({ blogs })
  }

  @Post()
  async create(req: Request) {
    const blog = await Blog.create(requireBlogParams(req.body))
    return ok({ blog })
  }

  @Get(':id')
  async get(req: Request) {
    const blog = await this.getBlog(req)
    return ok({ blog })
  }

  @Post(':id')
  async update(req: Request) {
    const blog = await this.getBlog(req)
    await blog.update(requireBlogParams(req.body))
    return ok({ blog })
  }
}
