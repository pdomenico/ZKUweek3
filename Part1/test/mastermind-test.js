//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const { expect, assert } = require("chai");

const wasm_tester = require("circom_tester").wasm;
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const { BigNumber } = require("ethers");

const { buildPoseidon } = require("circomlibjs");
const poseidonHash = async (items) => {
    let poseidon = await buildPoseidon();
    return BigNumber.from(poseidon.F.toObject(poseidon(items)));
}


describe("Mastermind variation circuit test", () => {
    it("Should work valid inputs with 1 hit and 2 blows", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is set to the salt
        const solution = ["5" ,"1", "4", "5", "7", "6"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "1",
            "guess2": "2",
            "guess3": "3",
            "guess4": "4",
            "guess5": "5",
            "numHit": "1",
            "numBlow": "2",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(solutionHash)));
    });

    it("Should give 5 hits if all guesses are correct", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is the salt
        const solution = ["6" ,"1", "2", "3", "4", "5"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "1",
            "guess2": "2",
            "guess3": "3",
            "guess4": "4",
            "guess5": "5",
            "numHit": "5",
            "numBlow": "0",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(solutionHash))); 
    });

    it("Should give 5 blows if guesses are correct numbers but wrong position", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is set to the salt
        const solution = ["6" ,"2", "3", "4", "5", "1"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "1",
            "guess2": "2",
            "guess3": "3",
            "guess4": "4",
            "guess5": "5",
            "numHit": "0",
            "numBlow": "5",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(solutionHash)));
    });

    it("Should revert if one guess is greater than 7", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is set to the salt
        const solution = ["6" ,"1", "2", "3", "4", "5"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "8",
            "guess2": "2",
            "guess3": "1",
            "guess4": "4",
            "guess5": "5",
            "numHit": "3",
            "numBlow": "2",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error)
    });

    it("Should revert if one solution is greater than 7", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is set to the salt
        const solution = ["6" ,"8", "2", "3", "4", "5"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "1",
            "guess2": "2",
            "guess3": "3",
            "guess4": "4",
            "guess5": "5",
            "numHit": "4",
            "numBlow": "0",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error)
    });

    it("Should revert if one guess is equal to another guess", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is set to the salt
        const solution = ["6" ,"1", "2", "3", "4", "5"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "1",
            "guess2": "1",
            "guess3": "2",
            "guess4": "4",
            "guess5": "5",
            "numHit": "2",
            "numBlow": "2",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error)
    });

    it("Should revert if one solution is equal to another", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is set to the salt
        const solution = ["6" ,"1", "1", "3", "4", "5"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "8",
            "guess2": "2",
            "guess3": "1",
            "guess4": "4",
            "guess5": "5",
            "numHit": "2",
            "numBlow": "2",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error)
    });

    it("Should revert if blow number is wrong", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is set to the salt
        const solution = ["6" ,"1", "2", "3", "4", "5"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "5",
            "guess2": "1",
            "guess3": "2",
            "guess4": "3",
            "guess5": "4",
            "numHit": "0",
            "numBlow": "3",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error)
    });

    it("Should revert if hit number is wrong", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        // solution[0] is set to the salt
        const solution = ["6" ,"1", "2", "3", "4", "5"];
        const solutionHash = await poseidonHash(solution);

        const INPUT = {
            "guess1": "1",
            "guess2": "2",
            "guess3": "3",
            "guess4": "4",
            "guess5": "5",
            "numHit": "3",
            "numBlow": "0",
            "solHash": solutionHash,
            "sol1": solution[1],
            "sol2": solution[2],
            "sol3": solution[3],
            "sol4": solution[4],
            "sol5": solution[5],
            "salt": solution[0],
        };

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error)
    })
})