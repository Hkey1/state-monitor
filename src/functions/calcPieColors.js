const assert = require('node:assert');
const mustBe = require('hkey-must-be');
function hsv2hsl({h, s, v}) {
    // both hsv and hsl values are in [0, 1]
    let l = (2 - s) * v / 2;
    if (l != 0) {
        if (l == 1) {
            s = 0;
        } else if (l < 0.5) {
            s = s * v / (l * 2);
        } else {
            s = s * v / (2 - l * 2);
        }
    }
    return {h, s, l};
}
module.exports = function calcPieColors(n){
	n = (Array.isArray(n)) ? n.length : n;
	assert.equal(typeof(n), 'number');
	assert.equal(n, Math.round(n)); // int

	const res  = [];
	const hsv0 = {h:262, s:61.9/100, v:88.6/100};
	const step = 240/n;
	for(let i=0; i<n; i++){
		const hsv = {...hsv0};
		hsv.h = (hsv0.h + step * (i+1) % 240.0);
		const {h,s,l} = hsv2hsl(hsv);
		res.push(`hsl(${h} ${Math.round(s*100)}% ${Math.round(l*100)}%)`);
	}
	return res;
}