// Function to check if the puzzle is solvable with the given character assignments
function solvePuzzleHelper(a, b, sum, pos, carry, charToDigit, usedDigits) {
    // Base case: if all positions are processed
    if (pos >= sum.length) {
        return carry === 0 ? 1 : 0;
    }

    // Calculate sum at current position
    let sumVal = carry;
    let aIdx = a.length - 1 - pos;
    let bIdx = b.length - 1 - pos;
    let sumIdx = sum.length - 1 - pos;

    // Add digits from a and b if available and assigned
    if (aIdx >= 0 && charToDigit[a[aIdx]] !== undefined) {
        sumVal += charToDigit[a[aIdx]];
    } else if (aIdx >= 0) {
        return 0; // Character not yet assigned, prune
    }
    if (bIdx >= 0 && charToDigit[b[bIdx]] !== undefined) {
        sumVal += charToDigit[b[bIdx]];
    } else if (bIdx >= 0) {
        return 0; // Character not yet assigned, prune
    }

    let sumChar = sum[sumIdx];

    // If sumChar is assigned, check if it matches
    if (charToDigit[sumChar] !== undefined) {
        if (charToDigit[sumChar] !== sumVal % 10) {
            return 0;
        }
        return solvePuzzleHelper(a, b, sum, pos + 1, Math.floor(sumVal / 10), charToDigit, usedDigits);
    }

    // If sumChar is not assigned, try to assign it
    let digit = sumVal % 10;
    if (usedDigits[digit]) {
        return 0; // Digit already used
    }

    // Assign and recurse
    charToDigit[sumChar] = digit;
    usedDigits[digit] = true;
    let count = solvePuzzleHelper(a, b, sum, pos + 1, Math.floor(sumVal / 10), charToDigit, usedDigits);
    // Backtrack
    charToDigit[sumChar] = undefined;
    usedDigits[digit] = false;
    return count;
}

// Function to assign digits to unique characters and count valid assignments
function assignDigits(a, b, sum, index, order, charToDigit, usedDigits, leadingChars) {
    if (index === order.length) {
        // Only enforce leading zero constraint for b[0] and sum[0]
        if ((b[0] && charToDigit[b[0]] === 0) || (sum[0] && charToDigit[sum[0]] === 0)) {
            return 0;
        }
        return solvePuzzleHelper(a, b, sum, 0, 0, charToDigit, usedDigits);
    }

    let ch = order[index];
    let totalSolutions = 0;

    // Try digits 0-9 for non-leading characters, 1-9 for b[0] and sum[0]
    let startDigit = (ch === b[0] || ch === sum[0]) ? 1 : 0;
    for (let digit = startDigit; digit < 10; digit++) {
        if (!usedDigits[digit]) {
            charToDigit[ch] = digit;
            usedDigits[digit] = true;
            totalSolutions += assignDigits(a, b, sum, index + 1, order, charToDigit, usedDigits, leadingChars);
            usedDigits[digit] = false;
            charToDigit[ch] = undefined;
        }
    }
    return totalSolutions;
}

// Main function to solve Cryptarithmetic puzzle and count all valid solutions
function solution(crypt) {
    let [a, b, sum] = crypt; // Destructure input array

    // Quick validation: check number of unique characters and length constraints
    let uniqueChars = new Set(a + b + sum);
    if (uniqueChars.size > 10 || sum.length < Math.max(a.length, b.length)) {
        return 0; // Impossible to solve
    }

    // Use array for charToDigit to reduce Map overhead
    let charToDigit = new Array(128); // ASCII size, assuming letters
    let usedDigits = new Array(10).fill(false);
    let order = [...uniqueChars];
    let leadingChars = new Set([a[0], b[0], sum[0]]);

    // Sort order to prioritize leading characters for early pruning
    order.sort((x, y) => {
        if ((x === b[0] || x === sum[0]) && !(y === b[0] || y === sum[0])) return -1;
        if (!(x === b[0] || x === sum[0]) && (y === b[0] || y === sum[0])) return 1;
        return 0;
    });

    return assignDigits(a, b, sum, 0, order, charToDigit, usedDigits, leadingChars);
}