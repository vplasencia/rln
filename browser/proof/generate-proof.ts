import { Identity, Group, type MerkleProof} from "@semaphore-protocol/core"
import { MAX_DEPTH, MIN_DEPTH } from "@semaphore-protocol/utils/constants"
import { Project, maybeGetSnarkArtifacts, type SnarkArtifacts } from "@zk-kit/artifacts"
import { requireDefined, requireNumber, requireObject, requireTypes } from "@zk-kit/utils/error-handlers"
import { packGroth16Proof } from "@zk-kit/utils/proof-packing"
import type { BigNumberish } from "ethers"
import { groth16, type NumericString } from "snarkjs"
import hash from "./hash"
import toBigInt from "./to-bigint"
import type { RLNProof } from "./types"

export default async function generateProof(
    identity: Identity,
    groupOrMerkleProof: Group | MerkleProof,
    message: BigNumberish | Uint8Array | string,
    scope: BigNumberish | Uint8Array | string,
    messageId: BigNumberish | Uint8Array | string,
    userMessageLimit: BigNumberish | Uint8Array | string,
    merkleTreeDepth?: number,
    snarkArtifacts?: SnarkArtifacts
): Promise<RLNProof> {
    requireDefined(identity, "identity")
    requireDefined(groupOrMerkleProof, "groupOrMerkleProof")
    requireDefined(message, "message")
    requireDefined(scope, "scope")
    requireDefined(messageId, "messageId")
    requireDefined(userMessageLimit, "userMessageLimit")

    requireObject(identity, "identity")
    requireObject(groupOrMerkleProof, "groupOrMerkleProof")
    requireTypes(message, "message", ["string", "bigint", "number", "Uint8Array"])
    requireTypes(scope, "scope", ["string", "bigint", "number", "Uint8Array"])
    requireTypes(messageId, "messageId", ["string", "bigint", "number"])
    requireTypes(userMessageLimit, "userMessageLimit", ["string", "bigint", "number"])


    if (merkleTreeDepth) {
        requireNumber(merkleTreeDepth, "merkleTreeDepth")
    }

    if (snarkArtifacts) {
        requireObject(snarkArtifacts, "snarkArtifacts")
    }

    // Message and scope can be strings, numbers or buffers (i.e. Uint8Array).
    // They will be converted to bigints anyway.
    message = toBigInt(message)
    scope = toBigInt(scope)
    userMessageLimit = toBigInt(userMessageLimit)
    messageId = toBigInt(messageId)

    let merkleProof

    // The second parameter can be either a Merkle proof or a group.
    // If it is a group the Merkle proof will be calculated here.
    if ("siblings" in groupOrMerkleProof) {
        merkleProof = groupOrMerkleProof
    } else {
        const leafIndex = groupOrMerkleProof.indexOf(identity.commitment)
        merkleProof = groupOrMerkleProof.generateMerkleProof(leafIndex)
    }

    const merkleProofLength = merkleProof.siblings.length

    if (merkleTreeDepth !== undefined) {
        if (merkleTreeDepth < MIN_DEPTH || merkleTreeDepth > MAX_DEPTH) {
            throw new TypeError(`The tree depth must be a number between ${MIN_DEPTH} and ${MAX_DEPTH}`)
        }
    } else {
        merkleTreeDepth = merkleProofLength !== 0 ? merkleProofLength : 1
    }

    // If the Snark artifacts are not defined they will be automatically downloaded.
    snarkArtifacts ??= await maybeGetSnarkArtifacts(Project.SEMAPHORE, {
        parameters: [merkleTreeDepth!],
        version: "4.0.0"
    })
    const { wasm, zkey } = snarkArtifacts

    // The index must be converted to a list of indices, 1 for each tree level.
    // The missing siblings can be set to 0, as they won't be used in the circuit.
    const merkleProofIndices: number[] = []
    const merkleProofSiblings = merkleProof.siblings

    for (let i = 0; i < merkleTreeDepth!; i += 1) {
        merkleProofIndices.push((merkleProof.index >> i) & 1)

        if (merkleProofSiblings[i] === undefined) {
            merkleProofSiblings[i] = 0n
        }
    }

    const { proof, publicSignals } = await groth16.fullProve(
        {
            secret: identity.secretScalar,
            userMessageLimit,
            messageId,
            merkleProofLength,
            merkleProofIndices,
            merkleProofSiblings,
            x: hash(message),
            scope: hash(scope)
        },
        wasm,
        zkey
    )

    return {
        y: publicSignals[0],
        merkleTreeDepth: merkleTreeDepth!,
        merkleTreeRoot: merkleProof.root.toString(),
        nullifier: publicSignals[2],
        message: message.toString() as NumericString,
        scope: scope.toString() as NumericString,
        points: packGroth16Proof(proof)
    }
}