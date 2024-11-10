const AsyncFunction = (async () => {}).constructor;
function givenClass(type, val){
	if(!val || !val.constructor || !val.constructor.name || val.constructor.name===type){
		return '('+type+')';
	} else {
		return '('+type+':'+val.constructor.name+')';
	}
}

function given(val){
	if(val===undefined || val===null || val===false || val===true){
		return ''+val;
	} else if(typeof(val)==='function'){
		let	displayType = 'Function'; 
		if(val instanceof AsyncFunction){
			displayType = 'AsyncFunction'; 
		} else if(/^\s*class\s+/.test(val.toString())){
			displayType = 'Class'; 
		}
		return val.name ? displayType+' '+val.name : 'Anonymous '+displayType;
	} else if(typeof(val)==='string'){
		const className = givenClass('String', val);
		if(val.length===0){
			return 'empty '+className;
		} if(val.length>15){
			return '"'+val.substring(0,12)+'..." ('+val.length+' symbols) '+className;
		} else {
			return ' "'+val+'" '+className;
		}
	} else if(typeof(val)==='number'){
		return val+' (Number)';
	} else if(val instanceof Buffer){
		const className = givenClass('Buffer', val);
		if(val.length===0){
			return 'empty '+className;
		} else {
			return className+'.length='+val.length;
		}
	} else if(Array.isArray(val)){
		const className = givenClass('Array', val);
		if(val.length===0){
			return 'empty '+className;
		} else {
			return className+'.length='+val.length ;
		}
	} else if(typeof(val)!=='object'){
		return '('+typeof(val)+')';
	} else if(val instanceof Promise){
		return givenClass('Promise', val);
	} else if(val instanceof Error){
		return givenClass('Error', val);
	} else if(typeof(val)==='object'){
		const className = givenClass('Object', val);
		const len = Object.keys(val).length;
		if(len===0){
			return 'empty '+className;
		} else {
			return className+'.keys='+len;
		}
	} 
}

module.exports = given;