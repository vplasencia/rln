# Circuits

This project contains the RLN V3 circom circuits.

## Install Dependencies

```sh
yarn
```

## Compile Circuit

```sh
yarn compile
```

## Generate Witness

```sh
yarn generate-witness
```

## Execute Groth16

```sh
yarn groth16
```

## Execute Plonk

```sh
yarn plonk
```

## Execute Fflonk

```sh
yarn fflonk
```

## Execute All Proving Systems (Groth16, Plonk and Fflonk)

```sh
yarn execute
```

## Run a Command with a Different Circuit

To run a command (e.g., compile, generate-witness) with a different circuit:

```sh
yarn <command> <circuit-name>
```

Example: Compile the `withdraw.circom` circuit:

```sh
yarn compile withdraw
```

## Remove Build Folder

```sh
yarn remove-build-folder
```

## Run Tests

```
yarn test
```

## Code Formatting

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

Or to automatically format the code:

```bash
yarn prettier:write
```
