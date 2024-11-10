const fs          = require('node:fs');
const stackParser = require('stack-parser');
const maxValues   = 5;

class MustBeError extends Error{
	constructor(msg, names=[], func){
		names = (typeof(names)==='string' || names===undefined)   ? [names] : names;
		
		let needToLoad = false;
		for(let i=0; i<maxValues;i++){
			if(msg.includes('{'+i+'}') && names[i]===undefined){
				needToLoad = true;
				break;
			}
		}

		if(needToLoad){
			try{
				const temp = {};
				Error.captureStackTrace(temp, func);				
				const {line, column, file} = stackParser.parse(temp.stack)[0];
				
				const allCode  = fs.readFileSync(file, 'utf8');
				const lines    = allCode.split('\n');
				const lineCode = lines[line-1];
				const callCode = lineCode.substring(column-1).trim();//.split('//')[0];

				//console.log({line, column, file, lineCode, callCode});

				let roundBracketLevel   = 0; 
				let squareBracketLevel  = 0; 
				let curlyBracketLevel   = 0; 
				let isInString          = false; 
				let isInComment         = false;
				let valName             = '';
				let valNum              = 0;
				for(let i=0; i<callCode.length; i++){
					const symbol = callCode[i];
					const next   = callCode[i+1];
					
					if(symbol==='/' && next==='*' && !isInComment && !isInString){
						isInComment = true;
					} else if(symbol==='*' && next==='/' && isInComment){
						isInComment = false;
					} else if((symbol==='"' || symbol==="'" || symbol==="`")  && !isInComment && !isInString){
						isInString = symbol;
					} else if(symbol===isInString  && !isInComment && isInString){
						isInString = false;
					} else if(symbol==='(' && !isInComment && !isInString){
						roundBracketLevel++;
					} else if(symbol===')' && !isInComment && !isInString && roundBracketLevel>0){
						roundBracketLevel--;
					} else if(symbol==='[' && !isInComment && !isInString){
						squareBracketLevel++;
					} else if(symbol===']' && !isInComment && !isInString && squareBracketLevel>0){
						squareBracketLevel--;
					} else if(symbol==='{' && !isInComment && !isInString){
						curlyBracketLevel++;
					} else if(symbol==='}' && !isInComment && !isInString && curlyBracketLevel>0){
						curlyBracketLevel--;
					} 
					if(symbol===',' && roundBracketLevel===1 && squareBracketLevel===0 && curlyBracketLevel===0 && !isInString && !isInComment){
						names[valNum] ??= valName.trim(); 
						valName = '';
						valNum++;
					} else if(roundBracketLevel>=1 && (roundBracketLevel!==1 || symbol!=='(')){
						valName = valName+symbol;
					}
				}
				if(valName){
					names[valNum] ??= valName.trim(); 
				}
			} catch(e){
				//console.error(e)
			}
		}

		for(let i=0; i<maxValues;i++){
			if(names[i]!==undefined){
				msg = msg.replaceAll('{'+i+'}', names[i]);
			}
		}
		super(msg);
		Error.captureStackTrace(this, func);
	}
}
module.exports = MustBeError; 