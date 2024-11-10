const assert = require('node:assert');
const mustBe = require('hkey-must-be');

module.exports = function splitOptions(options, firstKeys){
	mustBe.normalObject(options);
	assert.equal(typeof(firstKeys), 'object');
	assert(!(firstKeys instanceof Promise))
		
	const first  = {};
	const second = {...options};

	if(Array.isArray(firstKeys)){		
		firstKeys.forEach(key=>{
			first[key] = options[key];
			delete second[key];
		})
	} else for(let key in firstKeys){
		first[key] = options[key] ?? firstKeys[key];
		delete second[key];
	}		 	
	return [first, second];
};
