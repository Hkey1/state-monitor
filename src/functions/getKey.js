const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
module.exports = function(obj, key){
	const isMap = obj instanceof map;
	isMap || mustBe.normalObject(obj);
	return isMap ? map1.get(key) : obj[key];
};
