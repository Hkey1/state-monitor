const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const lib            = require('../../lib.js');
const isColWidth     = require('../../functions/isColWidth.js');
const AbstractObject = require('../AbstractObject.js');

const countItemsByClass = {}; 

class AbstractItem extends AbstractObject{
	static shortKey   = false
	static shortKeyTo = undefined;
	static isReplace  = false
	static templates  = {};
	static _options   = [
		'parent', 
		'name', 'isAutoName', 
		'width', 
		'icon', 'useIconInParents', 'useIconInPage',
		'badge', 'useBadgeInParents', 'useBadgeInPage',
		'templates',
	];
	static get allOptions(){
		if(!this._allOptions || !this.hasOwnProperty('_allOptions')){
			this._allOptions = [];
			let Parent      = this; 
			while(true){
				if(Parent._options){
					this._allOptions.push(...Parent._options)
				}
				if(Parent===AbstractItem){
					break;
				}
				Parent = Object.getPrototypeOf(Parent.prototype).constructor;
			}
		}
		return this._allOptions;
	}
	static get allOptionsMap(){
		if(!this._allOptionsMap || !this.hasOwnProperty('_allOptionsMap')){
			this._allOptionsMap = Object.fromEntries(this.allOptions.map(name=>[name, name]));
		}
		return this._allOptionsMap;
	}
	get allOptions()    {return this.constructor.allOptions};
	get allOptionsMap() {return this.constructor.allOptionsMap};
	
	constructor(options){
		super();

		assert(this.constructor !== AbstractItem); //Abstract

		this.options = this.normalizeOptions(options);
		this.checkOptions();
		
		mustBe.normalObject(this.options);		
		mustBe.normalObject(this.options.templates ??= {})
		
		this.parent     = this.options.parent;
		this.name       = this.options.name;
		
		assert(this.parent===undefined || (this.parent instanceof AbstractItem))
		assert(this.name===undefined   || typeof(this.name)==='string')

		this.setId();
	} 
	checkOptions(){
		const map = this.allOptionsMap;
		Object.keys(this.options).forEach(key=>{
			if(!(key in map) && key[0]!=='_'){
				throw new Error(`${this.constructor.name}: bad option='${key}'. Allowed options: `+this.allOptions.join(', '));
			}
		});// && key[0]!=='$'
	}
	async getIcon(req){		
		return await this.option('icon', req, 'string', true, true);
	}
	async getBadge(req){		
		return await this.option('badge', req, 'string', true, true);
	}
	setId(){
		const lc   = this.constructor.name.toLowerCase();
		const id   = countItemsByClass[lc] ||= 1;
		this.id    = lc+'-'+id; 
		this.intId = id;
		countItemsByClass[lc]++;
	}
	onPushed(){
		if(this.parent){
			assert(this.parent!==this);
			assert(this.parent instanceof AbstractItem);
		} else assert(this instanceof lib.base.Server);
	}
	onBeforeInit(){
		if(this.parent){
			const opts = this.parent.options;
			Object.keys(opts).forEach(key=>{
				if(key && key[0]==='_' && key.length>1){
					this.options[key.substring(1)] ??= opts[key];
				}
			});
			if(opts._){
				Object.keys(opts._).forEach(key=>{
					this.options[key] ??= opts[key];
				});
			}
		}
		super.onBeforeInit();
	}
	onInit(){
		super.onInit();
		this.parents.forEach(parent=>assert(parent!==this));
	}	
	onParentPushed(){}
	$parents(){
		let res = [], parent = this;
		while(parent = parent.parent){
			res.push(parent);
		}
		return res;
	}
	$isH(){return false};
	$h(){
		return this.parents.find(parent=>parent.isH).h + 1;	
	}
	$thisAndParents(){  return [this, ...this.parents]}
	$andParents(){      return this.thisAndParents; }
	$isContentCol(){    return false }
	$isContentRow(){    return false }
	$isContentRows(){   return false }
	$neadBeCol(){       return isColWidth(this.options.width)}
	$neadBeRow(){       return this.neadBeCol && this.isContentCol || (this.isPlainItems && isColWidth(this.options._width))};	
	$neadBeRows(){      return this.neadBeRow};
	$isAnyParentRow(){  return this.parent.isPlainItems && !this.parent.neadBeCol && !this.parent.isContentCol && (this.parent.neadBeRow  || this.parent.isContentRow  || this.parent.isAnyParentRow)};
	$isAnyParentRows(){ return this.parent.isPlainItems && !this.parent.neadBeCol && !this.parent.isContentCol && (this.parent.neadBeRows || this.parent.isContentRows || this.parent.isAnyParentRows)};
	$isPlainItems() {   return false }


	$useIconInParents(){return this.options.useIconInParents;}
	$useIconInPage(){return this.options.useIconInPage;}
	$useBadgeInParents(){return this.options.useBadgeInParents;}
	$useBadgeInPage(){return this.options.useBadgeInPage;}
	
	$haveIcon(){return ('icon' in this.options)}
	$haveBadge(){return ('badge' in this.options)}
	
	checkSpecialKeys(options, allowed=[]){
		const badKeys = this.getSpecialKeys(options).filter(key=>!allowed.includes(key));//lib.normalizeKey(key)
		if(badKeys.length){
			throw new Error(this.constructor.name+' not suport options keys : '+badKeys.join(', '))
		}
	}
	async renderBody(req, content=undefined){
		assert(this.wasInit);
		const width = this.options.width;
		content ??= await this.renderContent(req); 
		content = (this.neadBeCol  && !this.isContentCol)                            ? await this.template('col',  req, {content, width: this.options.width})      : content;
		content = (!this.neadBeCol && !this.isContentCol &&width && !isColWidth(width)) ? `<div style="width:${width}${!isNaN(1*width)?'':'px'}">${content}</div>` : content;
		content = (this.neadBeRow  && !this.isContentRow  && !this.isAnyParentRow)      ? await this.template('row',  req, {content})                              : content;
		content = (this.neadBeRows && !this.isContentRows && !this.isAnyParentRows)     ? await this.template('rows', req, {content})                              : content;
		return content;
	}	
	findTemplate(name){ 
		assert(this.wasInit);
		mustBe.notEmptyString(name);
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
		return template;
	}
	
	async template(name, req, data={}){ 
		assert(this.wasInit);
	
		mustBe.notEmptyString(name);
		mustBe.normalObject(req);
		mustBe.normalObject(data);
		mustBe.normalObject(req.sMon);
		
		const template = this.findTemplate(name);
		
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
		return lib.getSpecialKeys(options);
	}
}; 
module.exports = AbstractItem;
