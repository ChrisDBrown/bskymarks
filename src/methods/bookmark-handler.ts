import express from 'express'
import { postAtCode, userDid } from './id-resolver'
import { AppContext } from '../config'

const makeRouter = (ctx: AppContext) => {
  const router = express.Router()

  router.post('/bookmarks', async (req, res) => {
    console.log(req.body)
    if (
      !req.hasOwnProperty('body') ||
      !req.body.hasOwnProperty('url') ||
      !req.body.hasOwnProperty('handle')
    ) {
      res.status(422).send({ error: 'Invalid request' })
      return
    }

    const uri = await postAtCode(req.body.url)
    const did = await userDid(req.body.handle)

    console.log(uri)
    console.log(did)

    await ctx.db
      .insertInto('post')
      .values({
        uri: uri,
        did: did,
        indexedAt: new Date().toISOString(),
      })
      .onConflict((oc) => oc.doNothing())
      .execute()

    res.status(201).send({})
  })

  router.delete('/bookmarks', async (req, res) => {
    if (!req.body.hasOwnProperty('url') || !req.body.hasOwnProperty('handle')) {
      res.status(422).send({ error: 'Invalid request' })
      return
    }

    const uri = await postAtCode(req.body.url)
    const did = await userDid(req.body.handle)

    await ctx.db
      .deleteFrom('post')
      .where('post.uri', '=', uri)
      .where('post.did', '=', did)
      .execute()

    res.status(200).send({})
  })

  return router
}
export default makeRouter
