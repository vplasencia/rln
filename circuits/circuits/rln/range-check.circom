pragma circom 2.2.2;

include "bitify.circom";
include "comparators.circom";

template RangeCheck(LIMIT_BIT_SIZE) {
    assert(LIMIT_BIT_SIZE < 253);

    signal input messageId;
    signal input limit;

    signal bitCheck[LIMIT_BIT_SIZE] <== Num2Bits(LIMIT_BIT_SIZE)(messageId);
    signal rangeCheck <== LessThan(LIMIT_BIT_SIZE)([messageId, limit]);
    rangeCheck === 1;
}

// component main = RangeCheck(16);