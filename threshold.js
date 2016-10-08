var fraction = require('fraction.js');
var polyval = require('compute-polynomial')
var bigInt = require('big-integer');

module.exports = {
    /**
     * Distributes the key into multiple shares in the from (ID, KEYSHARE)
     * n: total number of shares to be made
     * k: threshold number of shares needed to reconstruct key
     * d: key to be distributed into shares
     * q: modulus
     * Return:  2d array of shares in the form of [ID, KEYSHARE]
     */
    keyDist: function(n, k, d, q){
        if(k == null){
            var k = Math.floor(n/2) + 1;
        }

        var secretShareArray = [];
        var secretShareDeviceArray = [];
        var deviceArray = [];
        var coefficients = [];

        for(var i = 1; i <= n; i++){
            deviceArray.push(i);
        }

        for(var i = 1; i < k; i++){
            coefficients.push(random_prime(1000,10000000));
        }

        coefficients.push(d);

        var secretShareArray = polyval(coefficients, deviceArray);

        for(var i = 0; i < n; i++){
            secretShareArray[i] %= q;
            secretShareDeviceArray.push([i+1, secretShareArray[i]]);
        }
        return secretShareDeviceArray;
    },

    /**
     * Constructs the key using the array of shares
     * array: the 2d array of shares in the form of [ID, KEYSHARE]
     * q: the modulus
     * return: the reconstructed key
     */
    keyConst: function(array, q){
        var l = polyInterpolation(array);
        var key = mod(l, q);
        return key.n;
    }
}


/**
 * Constructs the lagrange polynomial with passed in value 0; e.g. L(0)
 * array: the 2d array of shares in the form of [ID, KEYSHARE]
 * return: L(0) = reconstructed key
 */
var polyInterpolation = function(array){

    var answer =  new fraction(0);
    for(var i = 0; i < array.length; i++){
        var element = new fraction(1);
        for(var j = 0; j < array.length; j++){

            if(i != j){
                var num = array[j][0] * -1; // - xj
                var dem = array[i][0]-array[j][0]; // xi - xj
                var frac = new fraction(num).div(dem); // -xj/xi-xj
                element = element.mul(frac);
            }
        }
        answer = answer.add(element.mul(array[i][1]));
    }
    return answer;
}

/**
 * Gets a random prime number between passed in min and max
 * min: the lower bound for the random prime
 * max: the upper bound for the random prime
 */
var random_prime = function(min, max){
    var p = Math.floor(Math.random() * ((max - 1) - min + 1)) + min;
    if(bigInt(p).isPrime()===true){
        return p;
    }
    else {
        return random_prime(min, max);
    }
}

/**
 * Euclids extended algorithm used to compute GCD and Bezout's identity;
 * see https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
 * a: the first value in GCD(a,b)
 * b: the second value in GCD(a,b)
 */
var euclidsExtended = function(a,b){
    if (a == 0){
        return [b, 0, 1];
    }
    else{
        temp = euclidsExtended(b % a, a);
        g = temp[0];
        x = temp[1];
        y = temp[2];

        return [g, y-x*Math.floor(b/a), x];
    }
}

/**
 * Computes the modular inverse of a number and the modulus
 * a: the number
 * b: the modulus
 */
var modInv = function(a,b){
    var inv = euclidsExtended(a,b)[1];
    if(inv < 0){
        inv = inv + b;
    }
    return inv;
}

/**
 * Computes the modulo of a number and a modulus, regardless of negatives or rationals
 * a: the number
 * b: the modulus
 */
var mod = function(a,b){
    var a = new fraction(a).mod(b).add(b).mod(b);
    var floor = Math.floor(a);
    var fracComp = new fraction(a.mod(1).abs());
    if(fracComp != 0){
        return mod( mod(floor,b) + modFraction(fracComp, b), b);
    }
    else{
        return a.mod(b);
    }
}

/**
 * Computes the modulo of a fraction and a modulus
 * a: the number
 * b: the modulus
 */
var modFraction = function(a, b){
    return a.n * modInv(a.d, b);
}
