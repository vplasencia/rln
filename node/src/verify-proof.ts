import { Bench, Task } from "tinybench"
import {
  Identity,
  Group,
  generateProof as generateProofSemaphore,
  verifyProof as verifyProofSemaphore,
  type SemaphoreProof
} from "@semaphore-protocol/core"
import generateProof from "../../proof/src/generate-proof"
import verifyProof from "../../proof/src/verify-proof"
import { RLNProof } from "../../proof/src/types"

const generateTable = (task: Task) => {
  if (task && task.name && task.result) {
    return {
      Function: task.name,
      "ops/sec": task.result.error
        ? "NaN"
        : parseInt(task.result.hz.toString(), 10).toLocaleString(),
      "Average Time (ms)": task.result.error
        ? "NaN"
        : task.result.mean.toFixed(5),
      Samples: task.result.error ? "NaN" : task.result.samples.length
    }
  }
}

async function main() {
  const samples = 1

  const bench = new Bench({ time: 0, iterations: samples })

  // const bench = new Bench()

  const generateMembers = (size: number) => {
    return Array.from(
      { length: size },
      (_, i) => new Identity(i.toString())
    ).map(({ commitment }) => commitment)
  }

  let group: Group

  let semaphoreProof: SemaphoreProof

  let rlnProof: RLNProof

  let member: Identity

  let members: bigint[]

  let merkleTreeDepth: number

  bench
    .add(
      "Semaphore - Verify Proof 1 Member",
      async () => {
        await verifyProofSemaphore(semaphoreProof)
      },
      {
        beforeAll: async () => {
          group = new Group([])
          member = new Identity()
          group.addMember(member.commitment)
          semaphoreProof = await generateProofSemaphore(member, group, 1, 1)
        }
      }
    )
    .add(
      "RLN - Verify Proof 1 Member",
      async () => {
        await verifyProof(rlnProof)
      },
      {
        beforeAll: async () => {
          group = new Group([])
          member = new Identity()
          group.addMember(member.commitment)
          const leafIndex = group.indexOf(member.commitment)
          const merkleProof = group.generateMerkleProof(leafIndex)
          const merkleProofLength = merkleProof.siblings.length
          merkleTreeDepth = merkleProofLength !== 0 ? merkleProofLength : 1
          rlnProof = await generateProof(
            member,
            group,
            1,
            1,
            0,
            10,
            undefined,
            {
              zkey: `../rln-zk-artifacts/rln-${merkleTreeDepth}.zkey`,
              wasm: `../rln-zk-artifacts/rln-${merkleTreeDepth}.wasm`
            }
          )
        }
      }
    )
    .add(
      "Semaphore - Verify Proof 100 Member",
      async () => {
        await verifyProofSemaphore(semaphoreProof)
      },
      {
        beforeAll: async () => {
          members = generateMembers(100)
          group = new Group(members)
          const index = Math.floor(members.length / 2)
          member = new Identity(index.toString())
          semaphoreProof = await generateProofSemaphore(member, group, 1, 1)
        }
      }
    )
    .add(
      "RLN - Verify Proof 100 Member",
      async () => {
        await verifyProof(rlnProof)
      },
      {
        beforeAll: async () => {
          members = generateMembers(100)
          group = new Group(members)
          const index = Math.floor(members.length / 2)
          member = new Identity(index.toString())
          const leafIndex = group.indexOf(member.commitment)
          const merkleProof = group.generateMerkleProof(leafIndex)
          const merkleProofLength = merkleProof.siblings.length
          merkleTreeDepth = merkleProofLength !== 0 ? merkleProofLength : 1
          rlnProof = await generateProof(
            member,
            group,
            1,
            1,
            0,
            10,
            undefined,
            {
              zkey: `../rln-zk-artifacts/rln-${merkleTreeDepth}.zkey`,
              wasm: `../rln-zk-artifacts/rln-${merkleTreeDepth}.wasm`
            }
          )
        }
      }
    )
    .add(
      "Semaphore - Verify Proof 500 Member",
      async () => {
        await verifyProofSemaphore(semaphoreProof)
      },
      {
        beforeAll: async () => {
          members = generateMembers(500)
          group = new Group(members)
          const index = Math.floor(members.length / 2)
          member = new Identity(index.toString())
          semaphoreProof = await generateProofSemaphore(member, group, 1, 1)
        }
      }
    )
    .add(
      "RLN - Verify Proof 500 Member",
      async () => {
        await verifyProof(rlnProof)
      },
      {
        beforeAll: async () => {
          members = generateMembers(500)
          group = new Group(members)
          const index = Math.floor(members.length / 2)
          member = new Identity(index.toString())
          const leafIndex = group.indexOf(member.commitment)
          const merkleProof = group.generateMerkleProof(leafIndex)
          const merkleProofLength = merkleProof.siblings.length
          merkleTreeDepth = merkleProofLength !== 0 ? merkleProofLength : 1
          rlnProof = await generateProof(
            member,
            group,
            1,
            1,
            0,
            10,
            undefined,
            {
              zkey: `../rln-zk-artifacts/rln-${merkleTreeDepth}.zkey`,
              wasm: `../rln-zk-artifacts/rln-${merkleTreeDepth}.wasm`
            }
          )
        }
      }
    )
    .add(
      "Semaphore - Verify Proof 1000 Member",
      async () => {
        await verifyProofSemaphore(semaphoreProof)
      },
      {
        beforeAll: async () => {
          members = generateMembers(1000)
          group = new Group(members)
          const index = Math.floor(members.length / 2)
          member = new Identity(index.toString())
          semaphoreProof = await generateProofSemaphore(member, group, 1, 1)
        }
      }
    )
    .add(
      "RLN - Verify Proof 1000 Member",
      async () => {
        await verifyProof(rlnProof)
      },
      {
        beforeAll: async () => {
          members = generateMembers(1000)
          group = new Group(members)
          const index = Math.floor(members.length / 2)
          member = new Identity(index.toString())
          const leafIndex = group.indexOf(member.commitment)
          const merkleProof = group.generateMerkleProof(leafIndex)
          const merkleProofLength = merkleProof.siblings.length
          merkleTreeDepth = merkleProofLength !== 0 ? merkleProofLength : 1
          rlnProof = await generateProof(
            member,
            group,
            1,
            1,
            0,
            10,
            undefined,
            {
              zkey: `../rln-zk-artifacts/rln-${merkleTreeDepth}.zkey`,
              wasm: `../rln-zk-artifacts/rln-${merkleTreeDepth}.wasm`
            }
          )
        }
      }
    )

  // await bench.warmup()
  await bench.run()

  const table = bench.table((task) => generateTable(task))

  // Add column to show how many times V4 is faster/slower than V3.
  // Formula: highest average execution time divided by lowest average execution time.
  // Using highest ops/sec divided by lowest ops/sec would work too.
  table.map((rowInfo, i) => {
    if (rowInfo && !(rowInfo["Function"] as string).includes("RLN")) {
      rowInfo["Relative to Semaphore"] = ""
    } else if (rowInfo) {
      const v3AvgExecTime = bench.tasks[i - 1].result?.mean

      const v4AvgExecTime = bench.tasks[i]!.result?.mean

      if (v3AvgExecTime === undefined || v4AvgExecTime === undefined) return

      if (v3AvgExecTime > v4AvgExecTime) {
        rowInfo["Relative to Semaphore"] = `${(
          v3AvgExecTime / v4AvgExecTime
        ).toFixed(2)} x faster`
      } else {
        rowInfo["Relative to Semaphore"] = `${(
          v4AvgExecTime / v3AvgExecTime
        ).toFixed(2)} x slower`
      }
    }
  })

  console.table(table)

  // console.log(bench.results)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
