const assert    = require('node:assert');
const mustBe    = require('hkey-must-be');
class AbstractFilter{
	constructor(data=undefined){
		assert(this.constructor!==AbstractFilter); //Abstact
	}
};
module.exports = AbstractFilter;