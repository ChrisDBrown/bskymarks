import { HandleResolver } from '@atproto/identity'
import { InvalidRequestError } from '@atproto/xrpc-server'

export async function postAtCode(post: string) {
  if (post.startsWith('at://did:')) {
    return post
  }

  const matches = post.match('https://bsky.app/profile/(.*)/post/(.*)')

  if (!matches || matches.length !== 3) {
    throw new InvalidRequestError('Invalid Post Url', 'InvalidPostUrl')
  }

  const did = await userDid(matches[1])

  return `at://${did}/app.bsky.feed.post/${matches[2]}`
}

export async function userDid(user: string) {
  if (user.startsWith('did:')) {
    return user
  }

  const handleResolver = new HandleResolver()
  const did = await handleResolver.resolve(user)

  if (!did) {
    throw new InvalidRequestError('Invalid Handle', 'InvalidHandle')
  }

  return did
}
