import { PromiseValue } from 'type-fest'
import { create } from 'ipfs'

export type IPFS = PromiseValue<ReturnType<typeof create>>
