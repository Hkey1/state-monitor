const assert = require('node:assert');
const mustBe = require('hkey-must-be');

module.exports = function(tag, content='', attrs=undefined){
	if(typeof(content)==='object'){
		let tmp = content;
		if(typeof(attrs)==='string'){
			content = attrs;
		} else if(!attrs){
			content = '';			
		} else throw Error(`bad tag=${tag} arguments types tag(tag, ${typeof(content)},${typeof(attrs)})`)
		attrs = tmp;
	}	
	attrs ||= {};
	
	if(attrs.content!==undefined && content===''){
		content = attrs.content;
		attrs   = {...attrs};
		delete attrs.content
	}
	
	mustBe.notEmptyString(tag);
	mustBe.string(content);
	mustBe.normalObject(attrs);
	
	let html = `<${tag} `;
	for(let key in attrs){
		let val = attrs[key] 
		if(key!=='content' && val!==undefined){
			if(typeof(val)!=='string'){
				throw new Error(`bad tag=${tag} attribute=${key} type=${typeof val}`)
			}
			const s = val.includes(`"`) & !val.includes(`'`) ? `'` : `"`;
			html += ` ${key}=${s}${val}${s}`
		}
	}
	html+= '>';
	html+= content||'';
	html+= `</${tag}>`;
	
	return html;
}