#!/bin/bash

# Variable to store the name of the circuit
CIRCUIT=rln

# In case there is a circuit name as an input
if [ "$1" ]; then
    CIRCUIT=$1
fi

# Variable to store the number of the ptau file
PTAU=13

# In case there is a ptau file number as an input
if [ "$2" ]; then
    PTAU=$2
fi

# Path to the directory where the circuit is located
PATH_CIRCUIT=./circuits/${CIRCUIT}

# In case there is a path as input
if [ "$3" ]; then
    PATH_CIRCUIT=$3
fi

# Check if the necessary ptau file already exists. If it does not exist, it will be downloaded from the data center
if [ -f ./ptau/powersOfTau28_hez_final_${PTAU}.ptau ]; then
    echo "----- powersOfTau28_hez_final_${PTAU}.ptau already exists -----"
else
    echo "----- Download powersOfTau28_hez_final_${PTAU}.ptau -----"
    wget -P ./ptau https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_${PTAU}.ptau
fi

# Build directory path
BUILD_DIR=build/${CIRCUIT}/groth16

# Delete the build folder, if it exists
rm -r -f ${BUILD_DIR}

# Create the build folder
mkdir -p ${BUILD_DIR}

# Compile the circuit
circom ${PATH_CIRCUIT}/${CIRCUIT}.circom --r1cs --wasm --sym --c -o ${BUILD_DIR} -l ./node_modules/@zk-kit/binary-merkle-root.circom/src -l ./node_modules/circomlib/circuits

# Generate the witness.wtns
node ${BUILD_DIR}/${CIRCUIT}_js/generate_witness.js ${BUILD_DIR}/${CIRCUIT}_js/${CIRCUIT}.wasm ${PATH_CIRCUIT}/input.json ${BUILD_DIR}/${CIRCUIT}_js/witness.wtns

echo "----- Generate .zkey file -----"
# Generate a .zkey file that will contain the proving and verification keys together with all phase 2 contributions
snarkjs groth16 setup ${BUILD_DIR}/${CIRCUIT}.r1cs ptau/powersOfTau28_hez_final_${PTAU}.ptau ${BUILD_DIR}/${CIRCUIT}_0000.zkey

echo "----- Contribute to the phase 2 of the ceremony -----"
# Contribute to the phase 2 of the ceremony
snarkjs zkey contribute ${BUILD_DIR}/${CIRCUIT}_0000.zkey ${BUILD_DIR}/${CIRCUIT}_final.zkey --name="1st Contributor Name" -v -e="some random text"

echo "----- Export the verification key -----"
# Export the verification key
snarkjs zkey export verificationkey ${BUILD_DIR}/${CIRCUIT}_final.zkey ${BUILD_DIR}/verification_key.json

echo "----- Generate zk-proof -----"
# Generate a zk-proof associated to the circuit and the witness. This generates proof.json and public.json
snarkjs groth16 prove ${BUILD_DIR}/${CIRCUIT}_final.zkey ${BUILD_DIR}/${CIRCUIT}_js/witness.wtns ${BUILD_DIR}/proof.json ${BUILD_DIR}/public.json

echo "----- Verify the proof -----"
# Verify the proof
snarkjs groth16 verify ${BUILD_DIR}/verification_key.json ${BUILD_DIR}/public.json ${BUILD_DIR}/proof.json

# Ensure the circuit name starts with a capital letter 
CAP_CIRCUIT=$(echo "$CIRCUIT" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')

echo "----- Generate Solidity verifier -----"
# Generate a Solidity verifier that allows verifying proofs on Ethereum blockchain
snarkjs zkey export solidityverifier ${BUILD_DIR}/${CIRCUIT}_final.zkey ${BUILD_DIR}/${CAP_CIRCUIT}Verifier.sol

# Update the contract name in the Solidity verifier
# OSTYPE is a built-in variable that detects the Operative System
# darwin* is the OSTYPE for MacOS
# Cross-platform sed command
# macOS requires sed -i "", while Linux works with sed -i alone
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i "" "s/contract Groth16Verifier/contract ${CAP_CIRCUIT}Verifier/g" "${BUILD_DIR}/${CAP_CIRCUIT}Verifier.sol"
else
    sed -i "s/contract Groth16Verifier/contract ${CAP_CIRCUIT}Verifier/g" "${BUILD_DIR}/${CAP_CIRCUIT}Verifier.sol"
fi


echo "----- Generate and print parameters of call -----"
# Generate and print parameters of call
snarkjs generatecall ${BUILD_DIR}/public.json ${BUILD_DIR}/proof.json | tee ${BUILD_DIR}/parameters.txt
