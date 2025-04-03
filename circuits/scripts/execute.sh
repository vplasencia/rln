#!/bin/bash

echo "----- Remove build folder -----"
./scripts/removeBuildFolder.sh

echo "----- RLN -----"
echo "----- RLN Groth16 -----"
./scripts/executeGroth16.sh
echo "----- RLN Plonk -----"
./scripts/executePlonk.sh
echo "----- RLN Fflonk -----"
./scripts/executeFflonk.sh



