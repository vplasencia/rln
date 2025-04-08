"use client"
import {
  Identity,
  Group,
  generateProof as generateProofSemaphore,
  verifyProof as verifyProofSemaphore
} from "@semaphore-protocol/core"
import { run } from "@/utils/run"
import { generateMembers } from "@/utils/generate-members"
import { useState } from "react"
import generateProof from "../../proof/generate-proof"
import verifyProof from "../../proof/verify-proof"
import prettyMilliseconds from "pretty-ms"

export default function Home() {
  const [groupMembers, setGroupMembers] = useState<number>(100)
  const [times, setTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [resultGenerateProof, setResultGenerateProof] = useState("")
  const [resultVerifyProof, setResultVerifyProof] = useState("")
  const [log, setLog] = useState("")

  const generateText = (timeFunctions: number[]) => {
    let textGenerateProof = ""
    let textVerifyProof = ""

    const semaphoreProofGeneration = timeFunctions[0]
    const semaphoreProofVerification = timeFunctions[1]
    const rlnProofGeneration = timeFunctions[2]
    const rlnProofVerification = timeFunctions[3]

    if (semaphoreProofGeneration > rlnProofGeneration) {
      textGenerateProof = `RLN is ${(
        semaphoreProofGeneration / rlnProofGeneration
      ).toFixed(2)} x faster than Semaphore`
    } else {
      textGenerateProof = `RLN is ${(
        rlnProofGeneration / semaphoreProofGeneration
      ).toFixed(2)} x slower than Semaphore`
    }

    if (semaphoreProofVerification > rlnProofVerification) {
      textVerifyProof += `RLN is ${(
        semaphoreProofVerification / rlnProofVerification
      ).toFixed(2)} x faster than Semaphore`
    } else {
      textVerifyProof += `RLN is ${(
        rlnProofVerification / semaphoreProofVerification
      ).toFixed(2)} x slower than Semaphore`
    }
    setResultGenerateProof(textGenerateProof)
    setResultVerifyProof(textVerifyProof)
  }

  const addLog = async (text: string) => {
    setLog(text)
    // Give React a chance to render the UI so that it does not become unresponsive
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  const runFunctions = async () => {
    setLoading(true)

    setResultGenerateProof("")
    setResultVerifyProof("")

    const timeValues = []

    await addLog("Generating Group")

    const members = generateMembers(groupMembers)
    const group = new Group(members)
    const index = Math.floor(members.length / 2)
    const member = new Identity(index.toString())

    await addLog("Generating Semaphore Proof")

    // Semaphore Functions
    const [semaphoreProof, time0] = await run(async () =>
      generateProofSemaphore(member, group, 1, 1)
    )
    timeValues.push(prettyMilliseconds(time0))

    await addLog("Verifying Semaphore Proof")

    const [, time1] = await run(async () =>
      verifyProofSemaphore(semaphoreProof)
    )
    timeValues.push(prettyMilliseconds(time1))

    await addLog("Generating RLN Proof")

    // RLN Functions
    const leafIndex = group.indexOf(member.commitment)
    const merkleProof = group.generateMerkleProof(leafIndex)
    const merkleProofLength = merkleProof.siblings.length
    const merkleTreeDepth = merkleProofLength !== 0 ? merkleProofLength : 1

    const [proof, time2] = await run(async () =>
      generateProof(member, group, 1, 1, 0, 10, undefined, {
        zkey: `/rln-zk-artifacts/rln-${merkleTreeDepth}.zkey`,
        wasm: `/rln-zk-artifacts/rln-${merkleTreeDepth}.wasm`
      })
    )
    timeValues.push(prettyMilliseconds(time2))

    await addLog("Verifying RLN Proof")

    const [, time3] = await run(async () => verifyProof(proof))
    timeValues.push(prettyMilliseconds(time3))

    await addLog("Creating summary")

    setTimes(timeValues)

    generateText([time0, time1, time2, time3])
    setLoading(false)
  }

  return (
    <div>
      <div>
        <div>
          <div className="flex flex-col flex-wrap justify-center items-center mt-10 gap-10">
            <div>
              <div className="mb-2 text-xl">Group members</div>
              <input
                type="number"
                id="semaphore-input"
                defaultValue={100}
                onChange={(e) => setGroupMembers(Number(e.target.value))}
                aria-describedby="helper-text-explanation"
                className="mb-2 border text-sm rounded-lg block w-[230px] py-3 px-5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 focus-visible:outline-none"
                placeholder="100"
                required
              />
            </div>
            <button
              onClick={runFunctions}
              className="cursor-pointer transition-colors duration-150 py-2 px-5 text-lg font-medium rounded-md bg-blue-700 hover:bg-blue-800 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Generate benchmarks
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-around items-center mt-16 gap-10">
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-semibold">Semaphore</div>
            <div className="flex flex-col gap-4 mt-5">
              <div className="flex gap-2">
                <div>Generate Proof:</div>
                <div> {times[0] ? times[0] : "0ms"}</div>
              </div>
              <div className="flex gap-2">
                <div>Verify Proof:</div>
                <div>{times[1] ? times[1] : "0ms"}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-semibold">RLN</div>
            <div className="flex flex-col gap-4 mt-5">
              <div className="flex gap-2">
                <div>Generate Proof:</div>
                <div>{times[2] ? times[2] : "0ms"}</div>
              </div>
              <div className="flex gap-2">
                <div>Verify Proof:</div>
                <div>{times[3] ? times[3] : "0ms"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 flex justify-center items-center">
        {loading && (
          <div className="flex gap-2">
            <div className="loader"></div> {log}
          </div>
        )}
      </div>
      <div className="flex justify-center items-center">
        {!loading && resultGenerateProof && resultVerifyProof && (
          <div>
            <div className="flex flex-col gap-4 mt-5">
              <div className="flex gap-2">
                <div>Generate Proof:</div>
                <div>{resultGenerateProof}</div>
              </div>
              <div className="flex gap-2">
                <div>Verify Proof:</div>
                <div>{resultVerifyProof}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
