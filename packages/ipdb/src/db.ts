import { create } from 'ipfs'
import { PromiseValue } from 'type-fest'

type IPFS = PromiseValue<ReturnType<typeof create>>

type DataType = string

type ConstructorArgs = {
  ipfs: IPFS
  name: string
}

export class Database {
  private ipfs: IPFS
  private name: string
  constructor({ ipfs, name }: ConstructorArgs) {
    this.ipfs = ipfs
    this.name = name
  }
  static create(args: ConstructorArgs) {
    const db = new this(args)
    const ipfs = db.ipfs
  }
  public set(key: string, val: DataType) {}
}
