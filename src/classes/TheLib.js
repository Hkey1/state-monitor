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

		const key = Class.parentOptionsKey;		
		if(key) assert.equal(typeof(key), 'string');
		if(Class.isReplace){
			if(Class.name in this.classes) {
				const Old = this.classes[Class.name]
				if(Old.parentOptionsKey){
					delete this.classByKey[Old.parentOptionsKey];
				}
			}			
		} else {
			assert(!(Class.name in this.classes));
			if(key && (key in this.classByKey)){
				throw new Error(`${Class.name}.parentOptionsKey='${key}' is already defined by  ${this.classByKey[key].name}`);
			}
			const proto  = Object.getPrototypeOf(Class.prototype);
			const Parent = proto ? proto.constructor : undefined;
			if(Parent && Parent.parentOptionsKey && Parent.parentOptionsKey===key){
				throw new Error(`Class '${Class.name}' have same parentOptionsKey '${key}' that has parent Class '${Parent.name}'`);
			}
		}
		if(key){
			this.classByKey[key] = Class;
		}
		this.classes[Class.name] = Class;
	}
	classByParentOptionsKey(key0){
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
	createItemByParentOptionsKey(key0, parentOptions={}, parent=undefined){
		const key   = this.normalizeKey(key0);
		const Class = this.classByParentOptionsKey(key);
		const opts  = {[key]: parentOptions[key0], parent};
		Class.parentOptionsKeys.forEach(optKey=>{
			opts[optKey] = parentOptions[optKey]
		})
		return new Class(opts);
	}
};

module.exports = Lib;