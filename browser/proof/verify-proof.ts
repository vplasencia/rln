import { MAX_DEPTH, MIN_DEPTH } from "@semaphore-protocol/utils/constants"
import { requireArray, requireDefined, requireNumber, requireObject, requireString } from "@zk-kit/utils/error-handlers"
import { unpackGroth16Proof } from "@zk-kit/utils/proof-packing"
import { groth16 } from "snarkjs"
import hash from "./hash"
import { RLNProof } from "./types"
import verificationKeys from "./verification-keys.json"

/**
 * Verifies whether a Semaphore proof is valid. Depending on the depth of the tree used to
 * generate the proof, a different verification key will be used.
 * @param proof The Semaphore proof.
 * @returns True if the proof is valid, false otherwise.
 */
export default async function verifyProof(proof: RLNProof): Promise<boolean> {
    requireDefined(proof, "proof")
    requireObject(proof, "proof")

    const { y, merkleTreeDepth, merkleTreeRoot, nullifier, message, scope, points } = proof

    requireString(y, "proof.y")
    requireNumber(merkleTreeDepth, "proof.merkleTreeDepth")
    requireString(merkleTreeRoot, "proof.merkleTreeRoot")
    requireString(nullifier, "proof.nullifier")
    requireString(message, "proof.message")
    requireString(scope, "proof.scope")
    requireArray(points, "proof.points")

    if (merkleTreeDepth < MIN_DEPTH || merkleTreeDepth > MAX_DEPTH) {
        throw new TypeError(`The tree depth must be a number between ${MIN_DEPTH} and ${MAX_DEPTH}`)
    }

    const verificationKey = {
        ...verificationKeys,
        vk_delta_2: verificationKeys.vk_delta_2[merkleTreeDepth - 1],
        IC: verificationKeys.IC[merkleTreeDepth - 1]
    }

    return groth16.verify(
        verificationKey,
        [y, merkleTreeRoot, nullifier, hash(message), hash(scope)],
        unpackGroth16Proof(points)
    )
}