import { assert } from "chai"
import { describe } from "mocha"

const wasm_tester = require("circom_tester").wasm

describe("RLN circuit", function () {
    let rlnCircuit: any

    before(async function () {
        rlnCircuit = await wasm_tester("circuits/rln/rln.circom", {
            include: ["./node_modules/@zk-kit/binary-merkle-root.circom/src", "./node_modules/circomlib/circuits"]
        })
    })

    it("Should generate the witness successfully", async function () {
        let input = {
            secret: "1234",
            userMessageLimit: "3",
            messageId: "1",
            merkleProofLength: "3",
            merkleProofIndices: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            merkleProofSiblings: [
                2, 12583541437132735734108669866114103169564651237895298778035846191048104863326, 4, 0, 0, 0, 0, 0, 0, 0
            ],
            x: "1",
            scope: "2"
        }
        const witness = await rlnCircuit.calculateWitness(input)
        await rlnCircuit.assertOut(witness, {})
    })

    it("Should fail because the messageId is greater than userMessageLimit", async function () {
        let input = {
            secret: "1234",
            userMessageLimit: "3",
            messageId: "4",
            merkleProofLength: "3",
            merkleProofIndices: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            merkleProofSiblings: [
                2, 12583541437132735734108669866114103169564651237895298778035846191048104863326, 4, 0, 0, 0, 0, 0, 0, 0
            ],
            x: "1",
            scope: "2"
        }

        try {
            await rlnCircuit.calculateWitness(input)
        } catch (err: any) {
            //   console.log(err)
            assert(err.message.includes("Assert Failed"))
        }
    })
})
