const assert = require('node:assert');
const mustBe = require('hkey-must-be');

const countItemsByClass = {}; 
class AbstractItem{
	constructor(options){
		//assert(this.constructor.name !== 'AbstractItem');

		if(options.name   !== undefined) mustBe.notEmptyString(options.name);
		if(options.parent !== undefined) assert(parent instanceof AbstractItem);
		if(options.num    !== undefined) mustBe.notNegativeFiniteInt(options.name);
				
		this.options = {...options};		
		this.name    = this.options.name; 
		this.parent  = this.options.parent; 
		this.num     = this.options.num; 	
		
		const lc = this.constructor.name.toLowerCase();
		const id = countItemsByClass[lc] ||= 0;
		
		this.id    = lc+'-'+id; 
		this.intId = id;
			
		countItemsByClass[lc]++;
	}	 
	async template(name, req, data={}){ 
		mustBe.notEmptyString(name);
		mustBe.normalObject(req);
		mustBe.normalObject(data);

		const template = ((name in this.options.templates) 
			? this.options.templates[name] 
			: req.sMon.server.options.templates[name] || lib.
		);
		if(!template){
			throw new Error('template `'+name+'` not found');
		}

		const res = await template.call(this, req, data, this);
		if(typeof(res)!=='string'){
			throw new Error('template '+template+' return type='+typeof(res));
		}
		return res;
	} 
	async renderBody(req){
		return await this.renderContent(req);
	}
	async calcOption(key, req, type=undefined, dontThrow=false){
		const val = this.options[key];
		mustBe.oneOf(type, [undefined, 'string', 'array', 'number', 'object', 'boolean'])
		function check(val){
			if(type===undefined){
				return true;
			} else if(type==='string' || type==='number' || type==='object' || type==='boolean'){
				return typeof(val) ===  type;
			} else if(array){
				return Array.isArray(array);
			} else throw new Error('some thing gone wrong')
		}
		try{
			if(check(val)){
				return val;
			} else if(typeof(val)==='function'){
				const res = await val.call(this, req);
				if(!check(res)){
					throw new Error('option.'+key+'() must return '+type+'. Given: '+typeof(res));
				}
				return res;
			} else {
				throw new Error('option.'+key+' must be '+type+' or function. Given: '+typeof(val));
			}
		} catch(e){
			if(dontThrow){
				console.error(e);
				return e+'';
			} else throw e;
		}
	}

}
module.exports = AbstractItem;
