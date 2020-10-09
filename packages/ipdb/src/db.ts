import { v4 as uuid } from 'uuid'
import all from 'it-all'

import { IPFS } from './types'

type DataType = object

type ConstructorArgs = {
  ipfs: IPFS
  key?: string
  path: string
}

const decoder = new TextDecoder()

function concat(arrays: any[], length?: any) {
  if (!length) {
    length = arrays.reduce((acc, curr) => acc + curr.length, 0)
  }

  const output = new Uint8Array(length)
  let offset = 0

  for (const arr of arrays) {
    output.set(arr, offset)
    offset += arr.length
  }

  return output
}

/*
 * A database consists of a dictionary of key-value pairs and dangling dag objects
 * key: the label of the data
 * value: the CID of the data
 * dag objects: the data
 *
 * A database can be created with a name
 */
export class Database {
  private ipfs: IPFS
  private path: string
  private key?: string // only exists in owned databases
  private head: { [key: string]: string } = {}
  constructor({ key, ipfs, path }: ConstructorArgs) {
    this.ipfs = ipfs
    this.path = path
    this.key = key
  }
  private async sync() {
    if (this.isOwned()) {
      const cid = (await this.ipfs.add(JSON.stringify(this.head))).cid
      await this.ipfs.name.publish(`/ipfs/${cid}`, { key: this.key })
    } else {
      const head = JSON.parse(
        decoder.decode(concat(await all(await this.ipfs.get(this.path))))
      )
      this.head = head
    }
  }
  static async create(ipfs: IPFS) {
    const key = uuid()
    const id = (await ipfs.key.gen(key, { timeout: 3000 })).id
    const path = `/ipns/${id}`
    const db = new this({ ipfs, key, path })
    await db.sync()
    return db
  }
  static async open(ipfs: IPFS, path: string) {
    const db = new this({ ipfs, path })
    await db.sync()
    return db
  }
  public isOwned() {
    return typeof this.key !== 'undefined'
  }
  public async set(key: string, val: DataType) {
    const cid = await this.ipfs.dag.put(val)
    this.head[key] = cid
  }
  public async get(key: string) {
    await this.sync()
    const cid = this.head[key]
    if (!cid) throw new Error(`item ${key} not found`)
    return this.ipfs.dag.get(cid)
  }
}
