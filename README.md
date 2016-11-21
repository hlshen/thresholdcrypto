Implementation of threshold cryptography algorithm also known as Shamir's secret sharing algorithm.

Usage
=====

`var tc = require('thresholdcrypto.js');`

Key Distribution
----------------

`tc.keyDist(total, threshold, key, modulus);`

Modulus must be greater than or equal to the key for the algorithm to work.

#####E.G.

```
var shares = tc.keyDist(5, 3, 123, 250);
console.log(shares); 
//[ [ 1, 93 ], [ 2, 155 ], [ 3, 59 ], [ 4, 55 ], [ 5, 143 ] ]
```

Key Construction
----------------

`tc.keyConst(shareArray, modulus);`

#####E.G.

```
var key = tc.keyConst(shares, 250);
console.log(key);
//123
```
