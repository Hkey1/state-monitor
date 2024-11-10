const assert      = require('node:assert');
const MustBeError = require('./MustBeError.js');
const given       = require('./given.js');

const AsyncFunction = (async () => {}).constructor;

const combos012 = [
	[0,1,2],
	[0,2,1],
	[1,0,2],
	[1,2,0],
	[2,0,1],
	[2,1,0],
];

function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function isClass(val){
	return /^\s*class\s+/.test(val.toString())
}

const is     = {};
const mustBe = {is, MustBeError};

const functions = [{
	string               : val => typeof(val)==='string',
	array                : val => typeof(val)==='object' && Array.isArray(val),
	buffer               : val => val instanceof Buffer,
	promise              : val => val instanceof Promise,
	buffer               : val => val instanceof Buffer,
	error                : val => val instanceof Error,
	set                  : val => val instanceof Set,
	map                  : val => val instanceof Map,

	plainObject          : val => typeof(val)==='object' && val!==null && val.constructor.name==='Object',
	plainSet             : val => val instanceof Set && val.constructor.name==='Set',
	plainMap             : val => val instanceof Map && val.constructor.name==='Map',
	plainArray           : val => typeof(val)==='object' && Array.isArray(val) && val.constructor.name==='Array',

	objectOrArray        : val => typeof(val)==='object' && val!==null && !(val instanceof Promise) && !(val instanceof Error) && !(val instanceof Buffer) && !(val instanceof Map) && !(val instanceof Set) && !(val instanceof BigInt),
	normalObject         : val => typeof(val)==='object' && val!==null && !Array.isArray(val) && !(val instanceof Promise) && !(val instanceof Error) && !(val instanceof Buffer) && !(val instanceof Map) && !(val instanceof Set) && !(val instanceof BigInt),
	notEmpty             : val => {
		if(typeof(val)==='string' || Array.isArray(val) || val instanceof Buffer || val instanceof Buffer){
			return val.length > 0;
		} else if(val instanceof Set || val instanceof Map){
			return val.size > 0;
		} else if(val instanceof Error){
			return val.message && val.message.length > 0;
		} else if(val===null || typeof(val)!=='object'){
			return false;
		} else {
			return Object.keys(val).length > 0
		} 
	},
	'notEmpty.objectOrArray' : val =>  typeof(val)==='object'  && val!==null && !(val instanceof Promise) && !(val instanceof Error) && !(val instanceof Buffer) && !(val instanceof Map) && !(val instanceof Set) && !(val instanceof BigInt) && (Array.isArray(val) ? val : Object.keys(val)).length > 0,
	'notEmpty.array'         : val =>  typeof(val)==='object'  && Array.isArray(val) && val.length > 0,
	'notEmpty.string'        : val =>  typeof(val)==='string'  && val.length > 0,
	'notEmpty.buffer'        : val =>  (val instanceof Buffer) && val.length > 0,
	'notEmpty.set'           : val =>  (val instanceof Set)    && val.size > 0,
	'notEmpty.map'           : val =>  (val instanceof Map)    && val.size > 0,

	'notEmpty.plainSet'      : val =>  (val instanceof Set)    && val.constructor.name==='Set'    && val.size   > 0,
	'notEmpty.plainMap'      : val =>  (val instanceof Map)    && val.constructor.name==='Map'    && val.size   > 0,
	'notEmpty.plainMap'      : val =>  Array.isArray(val)      && val.constructor.name==='Array'  && val.length > 0,
	'notEmpty.plainObject'   : val =>  typeof(val)==='object'  && val!==null && val.constructor.name==='Object' && Object.keys(val).length > 0,
	'notEmpty.normalObject'  : val =>  typeof(val)==='object'  && val!==null && !Array.isArray(val) && !(val instanceof Promise) && !(val instanceof Error) && !(val instanceof Buffer) && !(val instanceof BigInt) && !(val instanceof Map) && !(val instanceof Set) && Object.keys(val).length > 0,

	'boolean'            : val => val===true || val===false,
	'bool'               : 'boolean',
	'true'               : val => val===true,
	'false'              : val => val===false,
	'defined'            : val => val!==undefined,
	'undefined'          : val => val===undefined,
	'null'               : val => val===null,
	'notNull'            : val => val!==null,
	number      		 : val => typeof(val)==='number',
	integer     		 : val => (typeof(val)==='number' && !isNaN(val) && Math.round(val)===val),
	'int'       		 : 'integer',
	notNan     		     : val => !isNaN(val),
	finite               : val => isFinite(val),
	infinite             : val => !isFinite(val),
	positive             : val => val>0,
	negative             : val => val<0,
	notNegative          : val => val>=0,
	notPositive          : val => val<=0,	
	'defined.notNull'    : val => val!==null && val===undefined,
	'positive.finite'                : val => val>0  && isFinite(val),	
	'notNegative.finite'             : val => val>=0 && isFinite(val),	
	'number.finite'                  : val => isFinite(val) && typeof(val)==='number' && Math.round(val)===val && !isNaN(val), 	
	'notNegative.number'             : val => val>=0 && !isNaN(val) && typeof(val)==='number',	
	'positive.number'                : val => val>0  && !isNaN(val) && typeof(val)==='number',	
	'integer.finite'                 : val => isFinite(val) && typeof(val)==='number' && Math.round(val)===val && !isNaN(val), 	
	'int.finite'                     : 'integer.finite', 	
	'notNegative.integer'            : val => val>=0 && !isNaN(val) && Math.round(val)===val,	
	'notNegative.int'                : 'notNegative.integer',	
	'positive.integer'               : val => val>0  && !isNaN(val) && Math.round(val)===val,	
	'positive.int'                   : 'positive.integer',	
	'negative.finite'                : val => val<0  && isFinite(val),	
	'notPositive.finite'             : val => val<=0 && isFinite(val),	
	'notPositive.number'             : val => val<=0 && !isNaN(val) && typeof(val)==='number',	
	'negative.number'                : val => val<0  && !isNaN(val) && typeof(val)==='number',	
	'notPositive.integer'            : val => val<=0 && !isNaN(val) && Math.round(val)===val,	
	'notPositive.int'                : 'notPositive.integer',	
	'negative.integer'               : val => val<0  && !isNaN(val) && Math.round(val)===val,	
	'negative.int'                   : 'negative.integer',	
	'positive.finite.integer'        : val => typeof(val)==='number' && !isNaN(val) && val>0  && isFinite(val) && Math.round(val)===val,
	'positive.finite.int'            : 'positive.finite.integer',	
	'positive.finite.number'         : val => typeof(val)==='number' && !isNaN(val) && val>0  && isFinite(val),
	'notNegative.finite.integer'     : val => typeof(val)==='number' && !isNaN(val) && val>=0 && isFinite(val) && Math.round(val)===val,
	'notNegative.finite.int'         : 'notNegative.finite.integer',
	'notNegative.finite.number'      : val => typeof(val)==='number' && !isNaN(val) && val>=0 && isFinite(val),
	'negative.finite.integer'        : val => typeof(val)==='number' && !isNaN(val) && val<0  && isFinite(val) && Math.round(val)===val,
	'negative.finite.int'            : 'negative.finite.integer',
	'negative.finite.number'         : val => typeof(val)==='number' && !isNaN(val) && val<0  && isFinite(val),
	'notPositive.finite.integer'     : val => typeof(val)==='number' && !isNaN(val) && val<=0 && isFinite(val) && Math.round(val)===val,
	'notPositive.finite.int'         : 'notPositive.finite.integer',
	'notPositive.finite.number'      : val => typeof(val)==='number' && !isNaN(val) && val<=0 && isFinite(val),
	
	'function'                       : val => typeof(val)==='function' && !isClass(val),
	'async.function'                 : val => typeof(val)==='function' && !isClass(val) && val instanceof AsyncFunction,
	'sync.function'                  : val => typeof(val)==='function' && !isClass(val) && !(val instanceof AsyncFunction),
	'async'                          : val => !isClass(val) && (val instanceof AsyncFunction || val instanceof Promise),
	'sync'                           : val => isClass(val)  || !(val instanceof AsyncFunction || val instanceof Promise),

	'class'                          : val => typeof(val)==='function' && isClass(val),
}, {
	'class.extends'                  : (val, val2) => typeof(val)==='function' && isClass(val) && val.prototype instanceof val2,
	'extends'                        : (val, val2) => (typeof(val)==='function' && isClass(val) && val.prototype instanceof val2) || (val instanceof val2),
	'instanceof'                     : (val, val2) => (val instanceof val2), 
	'oneOf'                          : (val, val2) => (val2.includes(val)),
}];






for(let i=1; i<=3; i++){
	for(let len=0; len<=1; len++){
		Object.entries(functions[len]).forEach(([name,method])=>{
			const parts = name.split('.');
			if(parts.length!==i){
				return;
			}
			const realName = typeof(method)==='string' ? method : name; 
			const isFun    = functions[len][realName]; 			
			assert(isFun);
			if(typeof(isFun)!=='function'){
				throw new Error('typeof(functions['+name+'=>'+realName+'])='+typeof(isFun)+'!==function');
			}
			assert(realName===name || realName in mustBe);
			const mustFun  = len===0 ? function(val, valName=undefined, func=undefined){ //realName!==name ? mustBe[realName] : 
				if(!isFun(val)){
					throw new MustBeError('{0} mustBe.'+name+'! Given: '+given(val), valName, func||mustFun);
				}
			} : function(val, val2, valName=undefined, func=undefined){  
				if(!isFun(val, val2)){
					throw new MustBeError('{0} mustBe.'+name+'(..., '+given(val2)+' )! Given: '+given(val), valName, func||mustFun);
				}
			};
			mustBe[name]  = mustFun;
			is[name]      = isFun;
			if(parts.length===2){
				const [part0, part1]    = parts;

				mustBe[part0][part1]         = mustFun;
				mustBe[part1][part0]         = mustFun;
				mustBe[part1+'_'+part0]      = mustFun;
				mustBe[part0+'_'+part1]      = mustFun;
				mustBe[part1+ucFirst(part0)] = mustFun;
				mustBe[part0+ucFirst(part1)] = mustFun;
				//console.log(part0,part1, typeof(is),  typeof(mustBe[part0]), typeof(is[part0]))
				is[part0][part1]             = isFun;
				is[part1][part0]             = isFun;
				is[part1+'_'+part0]          = isFun;
				is[part0+'_'+part1]          = isFun;
				is[part1+ucFirst(part0)]     = isFun;			
			} else if(parts.length===3){
				combos012.forEach(([j0,j1,j2])=>{
					const part0 = parts[j0];
					const part1 = parts[j1];
					const part2 = parts[j2];

					if(!mustBe[part0]){
						throw new Error('!mustBe['+part0+'] name='+name);
					} else if(!mustBe[part0][part1]){
						throw new Error('!mustBe['+part0+']['+part1+'] name='+name);
					}
					
					mustBe[part0][part1][part2]                 = mustFun;
					mustBe[part0+'_'+part1+'_'+part2]           = mustFun;
					mustBe[part0+ucFirst(part1)+ucFirst(part2)] = mustFun;
					
					is[part0][part1][part2]                 = isFun;
					is[part0+'_'+part1+'_'+part2]           = isFun;
					is[part0+ucFirst(part1)+ucFirst(part2)] = isFun;
				});
			}
		})
	}
}

mustBe.oneOf = function(val, val2, valName=undefined, func=undefined){  
	if(!val2.includes(val)){
		throw new MustBeError('{0} = '+given(val)+' MustBe.oneOf: '+val2.join(', '), valName, func||mustBe.oneOf);
	}
}

module.exports = mustBe;
