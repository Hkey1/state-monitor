const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
module.exports = function(obj, key){
	const isMap = obj instanceof Map;
	isMap || mustBe.normalObject(obj);
	return isMap ? obj.get(key) : obj[key];
};
