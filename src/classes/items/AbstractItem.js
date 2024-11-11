const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const lib            = require('../../lib.js');
const isColWidth     = require('../../functions/isColWidth.js');
const AbstractObject = require('../AbstractObject.js');

const countItemsByClass = {}; 

class AbstractItem extends AbstractObject{
	static parentOptionsKey  = false
	static parentOptionsKeys = []
	static isReplace         = false
	static templates         = {};
	
	constructor(options){
		super();

		assert(this.constructor !== AbstractItem); //Abstract

		this.options = this.normalizeOptions(options);
		
		mustBe.normalObject(this.options);		
		mustBe.normalObject(this.options.templates ??= {})
		
		this.parent     = this.options.parent;
		this.name       = this.options.name;
		
		assert(this.parent===undefined || (this.parent instanceof AbstractItem))
		assert(this.name===undefined   || typeof(this.name)==='string')

		this.setId();
	} 
	async getIcon(req, data=undefined){		
		return await this.option('icon', req, 'string', true, true);
	}
	setId(){
		const lc   = this.constructor.name.toLowerCase();
		const id   = countItemsByClass[lc] ||= 1;
		this.id    = lc+'-'+id; 
		this.intId = id;
		countItemsByClass[lc]++;
	}
	onPushed(){
		assert(this.parent!==this)
		assert(this.parent===undefined || (this.parent instanceof AbstractItem))
		if(!(this instanceof lib.base.Server) && !this.parent){
			throw new Error(`${this.constructor.name} ${this.name||''}: this.parent=${this.parent}`);
		}
	}
	onParentPushed(){}
	onInit(){
		//console.log('onInit', this.constructor.name)
		super.onInit();
		assert(this.parent===undefined || (this.parent instanceof AbstractItem))
		assert(this instanceof lib.base.Server || this.parent);
		this.parents.forEach(parent=>assert(parent!==this));
	}		
	getWidth(){
		return (this.options.width ?? (this.parent ? this.parent.options.childsWidth : undefined))
	}
	$parents(){
		let res = [], parent = this;
		while(parent = parent.parent){
			res.push(parent);
		}
		return res;
	}
	$thisAndParents(){  return [this, ...this.parents]}
	$andParents(){      return this.thisAndParents; }
	$isContentCol(){    return false }
	$isContentRow(){    return false }
	$isContentRows(){   return false }
	$neadBeCol(){       return isColWidth(this.getWidth())}
	$neadBeRow(){       return this.neadBeCol && this.isContentCol || (this.isPlainItems && isColWidth(this.options.childsWidth))};	
	$neadBeRows(){      return this.neadBeRow};
	$isAnyParentRow(){  return this.parent.isPlainItems && !this.parent.neadBeCol && !this.parent.isContentCol && (this.parent.neadBeRow  || this.parent.isContentRow  || this.parent.isAnyParentRow)};
	$isAnyParentRows(){ return this.parent.isPlainItems && !this.parent.neadBeCol && !this.parent.isContentCol && (this.parent.neadBeRows || this.parent.isContentRows || this.parent.isAnyParentRows)};
	$isPlainItems() {   return false }
	checkSpecialKeys(options, allowed=[]){
		const badKeys = this.getSpecialKeys(options).filter(key=>!allowed.includes(key));//lib.normalizeKey(key)
		if(badKeys.length){
			throw new Error(this.constructor.name+' not suport options keys : '+badKeys.join(', '))
		}
	}
	async renderBody(req, content=undefined){
		assert(this.wasInit);
		const width = this.getWidth();
		content ??= await this.renderContent(req); 
		content = (this.neadBeCol  && !this.isContentCol)                            ? await this.template('col',  req, {content, width: this.getWidth()})      : content;
		content = (!this.neadBeCol && !this.isContentCol &&width && !isColWidth(width)) ? `<div style="width:${width}${!isNaN(1*width)?'':'px'}">${content}</div>` : content;
		content = (this.neadBeRow  && !this.isContentRow  && !this.isAnyParentRow)      ? await this.template('row',  req, {content})                              : content;
		content = (this.neadBeRows && !this.isContentRows && !this.isAnyParentRows)     ? await this.template('rows', req, {content})                              : content;
		return content;
	}	
	async template(name, req, data={}){ 
		assert(this.wasInit);
	
		mustBe.notEmptyString(name);
		mustBe.normalObject(req);
		mustBe.normalObject(data);
		mustBe.normalObject(req.sMon);
		
		let template;
		const parents = this.andParents, len = parents.length;
		for(let i=0; i<len; i++){
			const parent = parents[i]
			if(name in parent.options.templates && parent.options.templates[name]!==undefined){
				template = parent.options.templates[name];
				break;
			} else if(name in parent.constructor.templates && parent.constructor.templates[name]!==undefined){
				template = parent.constructor.templates[name];
				break;
			}
		}
		template ??= lib.templates[name];
		
		if(template===undefined)            throw new Error(`${this.constructor.name} template '${name}' not found`);	
		if(typeof template !== 'function')	throw new Error(`${this.constructor.name} typeof template '${name}' = ${typeof template}. Expected: function`);

		this.options.templates[name] ??= template;

		const res = await template.call(this, req, data, this);

		if(typeof(res)!=='string')          throw new Error(`${this.constructor.name} template '${name}' return  type = ${typeof(res)}. Expected: string`);

		return res;
	} 
	async option(key, req, type=undefined, dontThrow=false, canBeUndefined=false, dontCache=false){
		mustBe.oneOf(type, [undefined, 'string', 'array', 'number', 'object', 'boolean'])
		function check(val){
			if(type===undefined){
				return true;
			} else if(type==='string' || type==='number' || type==='object' || type==='boolean'){
				return typeof(val) ===  type;
			} else if(type==='array'){
				return Array.isArray(val);
			} else throw new Error('some thing gone wrong')
		}
		try{
			if(!(key in this.options)){
				if(canBeUndefined){
					return '';
				} else throw new Error(`${this.constructor.name} options.${key} is undefined`);
			} 
			const val = this.options[key];
			if(check(val)){
				return val;
			} else if(typeof(val)==='function'){
				const cache = (req.sMon.cache ||= {});
				dontCache ||= (dontCache in val) && val.dontCache; 
				const cacheKey  = 'opt-'+this.id+'-'+key;
				const promise   = (!dontCache && (cacheKey in cache)) ? cache[cacheKey] : val.call(this, req, this);
				cache[cacheKey] = promise;
				const res = await promise;
				if(!check(res)){
					throw new Error('option.'+key+'() must return '+type+'. Given: '+typeof(res));
				}
				cache[cacheKey] = res;
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
	getSpecialKeys(options){
		const res = lib.getSpecialKeys(options);
		//console.log(this.constructor.name, Object.keys(options), res);
		return res;
	}
}; 
module.exports = AbstractItem;
