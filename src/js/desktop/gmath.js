var GMath = {
    sign: function(n) {
        return typeof n === 'number' ? n ? n < 0 ? -1 : 1 : n === n ? 0 : NaN : NaN;
    },

    clamp: function(n, min, max) {
        return Math.min(Math.max(n, min), max);
    },

    pmod: function(n, m) {
        return (n % m + m) % m;
    }
};

module.exports = GMath;
