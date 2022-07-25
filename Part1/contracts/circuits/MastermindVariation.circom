pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

// [assignment] implement a variation of mastermind from https://en.wikipedia.org/wiki/Mastermind_(board_game)#Variation as a circuit

// implementing super mastermind with 8 colors and 5 holes
template MastermindVariation() {
    // Public inputs 
    signal input guess1;
    signal input guess2;
    signal input guess3;
    signal input guess4;
    signal input guess5;
    signal input numHit;
    signal input numBlow;
    signal input solHash;

    // Private inputs
    signal input sol1;
    signal input sol2;
    signal input sol3;
    signal input sol4;
    signal input sol5;
    signal input salt;

    // Outputs
    signal output solHashOut;

    var guesses[5] = [guess1, guess2, guess3, guess4, guess5];
    var solutions[5] = [sol1, sol2, sol3, sol4, sol5];

    // Make sure guesses and solutions are all less than 8 (the number of colors)
    // and that no 2 solutions or guesses have the same value
    component guessLt[5];
    component solutionLt[5];
    component equalSol[10]; // the number of comparations is 10
    component equalGuess[10];
    var equalIdx = 0; 

    for (var i = 0; i < 5; i++) {
        guessLt[i] =  LessThan(4);
        guessLt[i].in[0] <== guesses[i];
        guessLt[i].in[1] <== 8;
        guessLt[i].out === 1;

        solutionLt[i] = LessThan(4);
        solutionLt[i].in[0] <== solutions[i];
        solutionLt[i].in[1] <== 8;
        solutionLt[i].out === 1;

        for (var j=i+1; j<5; j++) {
            // Create a constraint that the solution and guess digits are unique. no duplication.
            equalGuess[equalIdx] = IsEqual();
            equalGuess[equalIdx].in[0] <== guesses[i];
            equalGuess[equalIdx].in[1] <== guesses[j];
            equalGuess[equalIdx].out === 0;
            equalSol[equalIdx] = IsEqual();
            equalSol[equalIdx].in[0] <== solutions[i];
            equalSol[equalIdx].in[1] <== solutions[j];
            equalSol[equalIdx].out === 0;
            equalIdx += 1;
        }
    }

    // Count hits and blows
    var hits = 0;
    var blows = 0;
    component HBequal[25];

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            HBequal[i*5 + j] = IsEqual();
            HBequal[i*5 + j].in[0] <== guesses[i];
            HBequal[i*5 + j].in[1] <== solutions[j];

            if (i == j) hits += HBequal[i*5 + j].out;
            else blows += HBequal[i*5 + j].out;
        }
    }

    // Make sure public inputs of hits and blows correspond to the actual ones
    component equalHit = IsEqual();
    component equalBlow = IsEqual();
    equalHit.in[0] <== hits;
    equalHit.in[1] <== numHit;
    equalHit.out === 1;
    equalBlow.in[0] <== blows;
    equalBlow.in[1] <== numBlow;
    equalBlow.out === 1;

    // Make sure the hash provided is correct
    component poseidon = Poseidon(6);
    poseidon.inputs[0] <== salt;
    poseidon.inputs[1] <== sol1;
    poseidon.inputs[2] <== sol2;
    poseidon.inputs[3] <== sol3;
    poseidon.inputs[4] <== sol4;
    poseidon.inputs[5] <== sol5;
    
    solHashOut <== poseidon.out;
    solHashOut === solHash;

}

component main {public [guess1, guess2, guess3, guess4, guess5, numHit, numBlow, solHash]} = MastermindVariation();