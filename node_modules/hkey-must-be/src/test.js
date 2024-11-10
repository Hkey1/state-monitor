const mustBe = require('./index.js');

function mustThrow(fun){
	try{
		fun()
	} catch(e){
		return;
	}
	throw new Error('mustThrow');
}


mustBe.function(()=>{})
mustBe.syncFunction(()=>{})
mustBe.oneOf('3', ['1', '2']);




//mustBe.asyncFunction(()=>{})

