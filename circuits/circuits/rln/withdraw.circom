pragma circom 2.2.2;

include "babyjub.circom";
include "poseidon.circom";

template Withdraw() {
    signal input secret;
    signal input address;

    signal output identityCommitment;

    // Identity generation.
    // The circuit derives the EdDSA public key from a secret using
    // Baby Jubjub (https://eips.ethereum.org/EIPS/eip-2494),
    // which is basically nothing more than a point with two coordinates.
    // It then calculates the hash of the public key, which is used
    // as the commitment, i.e. the public value of the Semaphore identity.
    var Ax, Ay;
    (Ax, Ay) = BabyPbk()(secret);

    identityCommitment <== Poseidon(2)([Ax, Ay]);

    // Dummy constraint to prevent compiler optimizing it
    signal addressSquared <== address * address;
}

component main { public [address] } = Withdraw();