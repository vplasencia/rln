pragma circom 2.2.2;

include "babyjub.circom";
include "poseidon.circom";
include "binary-merkle-root.circom";
include "comparators.circom";
include "range-check.circom";

template RLN(MAX_DEPTH, LIMIT_BIT_SIZE) {
    // Private signals
    signal input secret;
    signal input userMessageLimit;
    signal input messageId;
    signal input merkleProofLength, merkleProofIndices[MAX_DEPTH], merkleProofSiblings[MAX_DEPTH];

    // Public signals
    signal input x;
    signal input scope;

    // Outputs
    signal output y, merkleRoot, nullifier;

    // The secret scalar must be in the prime subgroup order 'l'.
    var l = 2736030358979909402780800718157159386076813972158567259200215660948447373041;

    component isLessThan = LessThan(251);
    isLessThan.in <== [secret, l];
    isLessThan.out === 1;

    // Identity generation.
    // The circuit derives the EdDSA public key from a secret using
    // Baby Jubjub (https://eips.ethereum.org/EIPS/eip-2494),
    // which is basically nothing more than a point with two coordinates.
    // It then calculates the hash of the public key, which is used
    // as the commitment, i.e. the public value of the Semaphore identity.
    var Ax, Ay;
    (Ax, Ay) = BabyPbk()(secret);

    var identityCommitment = Poseidon(2)([Ax, Ay]);

    signal rateCommitment <== Poseidon(2)([identityCommitment, userMessageLimit]);

    // Proof of membership verification.
    // The Merkle root passed as output must be equal to that calculated within
    // the circuit through the inputs of the Merkle proof.
    // See https://github.com/privacy-scaling-explorations/zk-kit.circom/blob/main/packages/binary-merkle-root/src/binary-merkle-root.circom
    // to know more about how the 'BinaryMerkleRoot' template works.
    merkleRoot <== BinaryMerkleRoot(MAX_DEPTH)(rateCommitment, merkleProofLength, merkleProofIndices, merkleProofSiblings);

    // messageId range check
    RangeCheck(LIMIT_BIT_SIZE)(messageId, userMessageLimit);

    // SSS share calculations
    signal a1 <== Poseidon(3)([secret, scope, messageId]);
    y <== secret + a1 * x;

    // nullifier calculation
    nullifier <== Poseidon(1)([a1]);
}

component main { public [x, scope] } = RLN(20, 16);