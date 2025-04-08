# RLN V3

RLN V3 is a new version of the RLN protocol using the new features of [Semaphore V4](https://semaphore.pse.dev/):

- [EdDSA](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon) for the identity schema 

- [LeanIMT](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/lean-imt) for groups. It supports dynamic tree depth: the depth is updated as leaves are inserted, and a circuit with a maximum depth of 32 can be used to generate proofs for a tree of depth 10.

More info about the new features of Semaphore V4 can be found in the [v4.0.0 release](https://github.com/semaphore-protocol/semaphore/releases/tag/v4.0.0).


## Run Circuits

Navigate to the `circuits` folder:

```sh
cd circuits
```

Then follow the instructions in the `README.md` file inside the folder.

## Run Nodejs benchmarks

Navigate to the `node` folder:

```sh
cd node
```

Then follow the instructions in the `README.md` file inside the folder.

## Run browser benchmarks

You can use the live app: https://rln-benchmarks.vercel.app/

Navigate to the `browser` folder:

```sh
cd browser
```

Then follow the instructions in the `README.md` file inside the folder.
