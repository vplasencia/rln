import { Identity } from "@semaphore-protocol/core"

export function generateMembers(size: number): bigint[] {
  return Array.from({ length: size }, (_, i) => new Identity(i.toString())).map(
    ({ commitment }) => commitment
  )
}
