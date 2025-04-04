pragma circom 2.2.2;

include "bitify.circom";
include "comparators.circom";

// RangeCheck checks that 0 <= value < limit
template RangeCheck(LIMIT_BIT_SIZE) {
    assert(LIMIT_BIT_SIZE < 253);

    signal input value;
    signal input limit;

    signal output isInRange;

    // Converts value to bits and enforces 0 <= value < 2^LIMIT_BIT_SIZE
    _ <== Num2Bits(LIMIT_BIT_SIZE)(value);

    isInRange <== LessThan(LIMIT_BIT_SIZE)([value, limit]);
}

// component main = RangeCheck(16);