const assert         = require('node:assert');
const {dirname}      = require('node:path');
const mustBe         = require('hkey-must-be');
const AbstractObject = require('./AbstractObject.js');
const requireAll     = require('../functions/requireAll.js');

let wasIntance = false;
class Lib extends AbstractObject{
	$templates()  {return requireAll(dirname(__dirname)+'/templates/')}
	$base()       {return requireAll(__dirname+'/items/')}
	onInit(){
		assert(!wasIntance); wasIntance = true; //only one instance
		super.onInit();
		this.classes    = {};
		this.classByKey = {};
		Object.entries(this.base).forEach(([name, Class])=>this.addClass(Class, name));
	}
	addClass(Class, name=undefined){
		if(name) assert.equal(typeof(name), 'string');
		if(typeof(Class)!=='function') throw new Error(`typeof ${name||'Class'} = ${typeof(Class)}`);
		assert.equal(typeof(Class), 'function');
		if(name && Class.name!==name) throw new Error(`Class.name!==name : '${Class.name}'!=='${name}'`);
		
		if(!(Class.prototype instanceof this.base.AbstractItem) && Class!==this.base.AbstractItem){
			throw new Error(`${Class.name} is not extends ${this.base.AbstractItem.name}`);
		}
		assert(Class.name);

		const key = Class.shortKey;		
		if(key) assert.equal(typeof(key), 'string');
		if(Class.isReplace){
			if(Class.name in this.classes) {
				const Old = this.classes[Class.name]
				if(Old.shortKey){
					delete this.classByKey[Old.shortKey];
				}
			}			
		} else {
			if(Class.name in this.classes){
				throw new Error(`class ${Class.name} already exists`);
			}
			if(key && (key in this.classByKey)){
				throw new Error(`${Class.name}.shortKey='${key}' is already defined by  ${this.classByKey[key].name}`);
			}
			const proto  = Object.getPrototypeOf(Class.prototype);
			const Parent = proto ? proto.constructor : undefined;
			if(Parent && Parent.shortKey && Parent.shortKey===key){
				throw new Error(`Class '${Class.name}' have same shortKey '${key}' that has parent Class '${Parent.name}'`);
			}
		}
		if(key){
			this.classByKey[key] = Class;
		}
		this.classes[Class.name] = Class;
		
		if(Class.addToBase){
			assert(!this.base[Class.name]);
			this.base[Class.name] = Class.name;
		}
		if(Class.defineSubClasses){
			Class.defineSubClasses();
		}	
	}
	classByShortKey(key0){
		if(key0 in this.classByKey){
			return this.classByKey[key0];
		}
		const key = this.normalizeKey(key0);
		if(key in this.classByKey){
			return this.classByKey[key];
		} else {
			return undefined;
		}
	}
	normalizeKey(key0){
		return key0.split('$')[0]
	}
	getSpecialKeys(options){
		assert(this.wasBeforeInit);
		assert(this.wasInit);
		assert(this.classByKey);
		return Object.keys(options).filter(key0=>{
			const key = this.normalizeKey(key0);		
			return (true
				&& (key in this.classByKey) 
				&& this.classByKey[key] 
				&& this.classByKey.hasOwnProperty(key)
				&& (key0 in options) 
				&& options[key0]!==undefined
				&& options.hasOwnProperty(key0)
			);
		});		
	}
	createItemByShortKey(key0, parentOptions={}, parent=undefined, opts0={}){
		const key    = this.normalizeKey(key0);
		const Class  = this.classByShortKey(key);
		const copyTo = Class.shortKeyTo ?? key;
		const pVal   = parentOptions[key0];
		if(copyTo){
			return new Class({...opts0, [copyTo]: pVal});
		} else if(typeof(pVal)!=='object' || pVal.constructor!==Object){
			const res = new Class(pVal);
			for(let k in opts0){
				res.options[k] = opts0[k];
			}
			return res; 
		} else {
			return new Class({...opts0,...pVal});
		}
	}
};
module.exports = Lib;