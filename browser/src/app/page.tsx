"use client"
import {
  Identity,
  Group,
  generateProof as generateProofSemaphore,
  verifyProof as verifyProofSemaphore,
} from "@semaphore-protocol/core"
import { run } from "@/utils/run"
import { generateMembers } from "@/utils/generate-members"
import { useState } from "react"
import generateProof from "../../../proof/src/generate-proof"
import verifyProof from "../../../proof/src/verify-proof"

export default function Home() {
  const [semaphoreGroupMembers, setSemaphoreGroupMembers] =
    useState<number>(100)
  const [rlnGroupMembers, setrlnGroupMembers] = useState<number>(100)
  const [semaphoreTimes, setSemaphoreTimes] = useState<number[]>([])
  const [rlnTimes, setRlnTimes] = useState<number[]>([])
  
  const runSemaphoreFunctions = async () => {
    const timeValues = []

    const members = generateMembers(semaphoreGroupMembers)
    const group = new Group(members)
    const index = Math.floor(members.length / 2)
    const member = new Identity(index.toString())
    const [proof, time0] = await run(async () => generateProofSemaphore(member, group, 1, 1))
    console.log("time0", time0)
    timeValues.push(Number(time0.toFixed(3)))
    const [, time1] = await run(async () => verifyProofSemaphore(proof))
    console.log("time1", time1)
    timeValues.push(Number(time1.toFixed(3)))
    setSemaphoreTimes(timeValues)
  }

  const runRLNFunctions = async () => {
    const timeValues = []

    const members = generateMembers(rlnGroupMembers)
    const group = new Group(members)
    const index = Math.floor(members.length / 2)
    const member = new Identity(index.toString())
    const leafIndex = group.indexOf(member.commitment)
    const merkleProof = group.generateMerkleProof(leafIndex)
    const merkleProofLength = merkleProof.siblings.length
    const merkleTreeDepth = merkleProofLength !== 0 ? merkleProofLength : 1

    const [proof, time0] = await run(async () => generateProof(member, group, 1, 1, 0, 10, undefined, {
      zkey: `../rln-zk-artifacts/rln-${merkleTreeDepth}.zkey`,
      wasm: `../rln-zk-artifacts/rln-${merkleTreeDepth}.wasm`
    }))

    timeValues.push(Number(time0.toFixed(3)))
    const [, time1] = await run(async () => verifyProof(proof))
    timeValues.push(Number(time1.toFixed(3)))

    setRlnTimes(timeValues)
  }

  return (
    <div>
      <div className="flex flex-wrap justify-around items-center mt-10 gap-10">
        <div className="flex flex-col gap-4">
          <div className="text-2xl font-semibold">Semaphore</div>
          <div>
            <div className="mb-2">Group members</div>
            <input
              type="number"
              id="semaphore-input"
              defaultValue={100}
              onChange={(e) => setSemaphoreGroupMembers(Number(e.target.value))}
              aria-describedby="helper-text-explanation"
              className="mb-2 border text-sm rounded-lg block w-4/5 py-3 px-5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
              required
            />
            <button
              onClick={runSemaphoreFunctions}
              className="mt-10 cursor-pointer transition-colors duration-150 py-3 px-5 text-lg font-medium rounded-md bg-blue-700 hover:bg-blue-800"
            >
              Run functions
            </button>
          </div>
          <div className="flex flex-col gap-4 mt-5">
            <div className="flex gap-2">
              <div>Generate Proof:</div>
              <div> {semaphoreTimes[0]? semaphoreTimes[0]:0} ms</div>
            </div>
            <div className="flex gap-2">
              <div>Verify Proof:</div>
              <div>{semaphoreTimes[1]? semaphoreTimes[1]:0} ms</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-2xl font-semibold">RLN</div>
          <div>
            <div className="mb-2">Group members</div>
            <input
              type="number"
              id="rln-input"
              defaultValue={100}
              onChange={(e) => setrlnGroupMembers(Number(e.target.value))}
              aria-describedby="helper-text-explanation"
              className="mb-2 border text-sm rounded-lg block w-4/5 py-3 px-5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
              required
            />
            <button
              onClick={runRLNFunctions}
              className="mt-10 cursor-pointer transition-colors duration-150 py-3 px-5 text-lg font-medium rounded-md bg-blue-700 hover:bg-blue-800"
            >
              Run functions
            </button>
          </div>
          <div className="flex flex-col gap-4 mt-5">
            <div className="flex gap-2">
              <div>Generate Proof:</div>
              <div>{rlnTimes[0]? rlnTimes[0]:0} ms</div>
            </div>
            <div className="flex gap-2">
              <div>Verify Proof:</div>
              <div>{rlnTimes[1]? rlnTimes[1]:0} ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
