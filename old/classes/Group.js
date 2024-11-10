const assert           = require('node:assert');
const mustBe           = require('hkey-must-be');
const AbstractItem     = require('./AbstractItem.js');
const HTML             = require('./HTML.js');

let Page;
class Group extends AbstractItem{	
	constructor(options){
		assert.equal(typeof(options), 'object');		
		assert(!(options instanceof Promise));
		assert(!(options instanceof AbstractItem));
		options = Array.isArray(options) ? {items: options} : options;
				
		if(options.html){
			if(options.items===undefined){
				options.items = [options.html];
			} else if(Array.isArray(options.items)){
				options.items.push(options.html);
			} else if(typeof(options.items)==='object'){
				assert(options.items.html===undefined);
				options.items.html = options.html;
			}
		}		
		
		super(options);
		
		this.items      = [];
		this.itemByName = {};
		
		const items = this.options.items;
		const type  = typeof(items)
		
		if(options.items===undefined){
			this.options.items = [];
		} else if(type==='string' || type==='function' || (type==='object' && items instanceof AbstractItem)){
			this.options.items = [items];
		} else if(type==='object'){
			if(!Array.isArray(items)){
				assert(!(items instanceof Promise));
				this.options.items = Object.entries(items).map(([name, opts])=>
					this.normalizeChild(opts, name)
				);
			}
		} else throw new Error('typeof(options.items)='+type);
		
		this.options.items.forEach(item=>this.push(item));				
	}	
	createChild(opts){
		return Array.isArray(opts) ? new Group({items: opts}) : new HTML({html: opts});
	}
	createChildAndSetName(opts, name=undefined){
		return this.setChildName(this.createChild(opts), name);
	}
	setChildName(child, name=undefined){
		if(name!==undefined){
			if(child.name===undefined){
				child.name = name;
			} else assert.equal(child.name, name);
		} else {
			assert(child.name || !this.options.checkItemName)
		}
		return child;
	}
	normalizeChild(opts, name=undefined){
		assert(!(opts instanceof Promise));
		assert(opts!==this);
		assert(opts!==this.parent);
		
		if(name!==undefined) mustBe.notEmptyString(name);

		if(typeof(opts)==='function'){
			assert(!opts.prototype || !(opts.prototype instanceof AbstractItem));
			return this.createChildAndSetName(opts, name || opts.name || undefined);
		} else if(typeof(opts)==='string'){
			return this.createChildAndSetName(opts, name);
		} else if(typeof(opts)==='object'){
			if(opts instanceof AbstractItem){
				assert(opts.constructor !== AbstractItem);
				return this.setChildName(opts, name);
			} else if(Array.isArray(opts)){
				return new Group({opts});				
			} else {
				mustBe.plainObject(opts);
				return this.createChildAndSetName(opts, name);
			}
		} else if(name) throw new Error(`typeof(items[${key}])=`+typeof(opts))
		else throw new Error(`typeof(item)=`+typeof(opts));
	}
	
	push(item){
		item = this.normalizeChild(item);
		assert(item!==this);
		assert(item!==this.parent || !this.parent);
		
		if(item.name!==undefined){
			mustBe.notEmptyString(item.name);
			if(item.name in this.itemByName) throw new Error('already has item with name = '+item.name);		
			this.itemByName[item.name] = item;
		}
		
		item.parent = this;
		item.num    = this.items.length;
		
		this.items.push(item);
		item.onPushed();
	}
	async renderContent(req){
		return ((await Promise.all(this.items.map(item=>item.render(req)))).join(' '));
	}
};
module.exports = Group;