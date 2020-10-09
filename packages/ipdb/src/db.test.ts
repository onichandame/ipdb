import { create } from 'ipfs'

import { IPFS } from './types'

describe('Database', () => {
  let ipfs: IPFS

  beforeAll(async done => {
    ipfs = await create({ silent: true, EXPERIMENTAL: { ipnsPubsub: true } })
    done()
  }, 10000)

  afterAll(async done => {
    console.log(`stopping`)
    await ipfs.stop()
    console.log(`stopped`)
    done()
  }, 3000)

  test(`dummy`, () => expect(true).toBeTruthy())
})
