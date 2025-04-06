import type { NumericString } from "snarkjs"
import type { PackedGroth16Proof } from "@zk-kit/utils"

export type RLNProof = {
    y: NumericString,
    merkleTreeDepth: number
    merkleTreeRoot: NumericString
    message: NumericString
    nullifier: NumericString
    scope: NumericString
    points: PackedGroth16Proof
}