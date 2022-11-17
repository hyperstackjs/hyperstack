import { test } from '@hyperstackjs/testing'
import { root } from '../../../config/settings'
import { appContext } from '../../../app'

const {
  requests,
  matchers: { matchRequestWithSnapshot },
} = test(root)

describe('requests', () => {
  describe('/blogs', () => {
    requests('all', async (request) => {
      const { Blog } = appContext.models()
      await Blog.create({
        content: 'interesting blog',
        title: 'this is the title',
      })

      await matchRequestWithSnapshot(200, request().get(`/blogs`))
    })
    requests('create', async (request) => {
      await matchRequestWithSnapshot(
        200,
        request().post(`/blogs`).send({
          content: 'interesting blog',
          title: 'this is the title',
        })
      )
    })
    requests('get :id', async (request) => {
      const { Blog } = appContext.models()
      const blog = await Blog.create({
        content: 'interesting blog',
        title: 'this is the title',
      })

      await matchRequestWithSnapshot(200, request().get(`/blogs/${blog.id}`))
    })
    requests('update :id', async (request) => {
      const { Blog } = appContext.models()
      const blog = await Blog.create({
        content: 'interesting blog',
        title: 'this is the title',
      })
      await request()
        .post(`/blogs/${blog.id}`)
        .send({
          content: 'interesting blog' + 'update',
          title: 'this is the title' + 'update',
        })

      await matchRequestWithSnapshot(200, request().get(`/blogs/${blog.id}`))
    })
  })
})
