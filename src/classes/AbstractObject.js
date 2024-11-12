const assert = require('node:assert');
const mustBe = require('hkey-must-be');

class AbstractObject{
	constructor(){
		assert(this.constructor!==AbstractObject); //this is abstract class
		this.wasInit       = false;
		this.wasBeforeInit = false;
		this.initProps     = this.getInitPropertyNames().filter(key=>this[key]===undefined);
		
		//This is necessary because onInit child items can access to parent elements and vice versa 		
		const opts = { enumerable : true };
		this.initProps.forEach(key=>{
			Object.defineProperty(this, key, {
				...opts,
				configurable : true,
				get : function(){
					if(!this.wasBeforeInit) throw new Error(`Cant access to property '${key}' before init started`)
					return (this[key] = this['$'+key]());
				}, 
				set : function(value){
					Object.defineProperty(this, key, {value, ...opts, writable : true, configurable : false}); 
					this[key] = value;	
				},
			});
		});
	}
	beforeInit(){
		if(!this.wasBeforeInit){
			this.wasBeforeInit = true;
			this.onBeforeInit();
		}
	}
	onBeforeInit(){
		assert(this.wasBeforeInit);
	}
	init(){
		if(!this.wasInit){
			this.beforeInit();
			this.wasInit = true;
			this.onInit();
		}
	}
	onInit(){
		assert(this.wasInit);
		this.initProps.forEach(key=>{
			this[key] = this['$'+key]();
		});
	}
	getInitPropertyNames(){
		let proto = this, res  = [];
		while(proto = Object.getPrototypeOf(proto)){
			if(proto.constructor === AbstractObject){
				break;
			}
			res.push(...Object.getOwnPropertyNames(proto))
		}
		const was = {};
		return res.filter(key=>{
			if(key in was) return false;
			was[key] = true;
			return (key[0]==='$' && typeof(this[key])==='function' && key!=='constructor')
		}).map(key=>key.substring(1)); 
	}  
};

module.exports = AbstractObject;