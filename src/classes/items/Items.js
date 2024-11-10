const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Items extends AbstractItem{
	static parentOptionsKey       = 'items'
	static parentOptionsKeys      = []

	static canItemsBeObject       = false
	static childNameMustBeUnique  = false
	static childNameMustBeDefined = false
	
	get canItemsBeObject()       {return this.constructor.canItemsBeObject}
	get childNameMustBeUnique()  {return this.constructor.childNameMustBeUnique}
	get childNameMustBeDefined() {return this.constructor.childNameMustBeDefined}
	
	constructor(options){
		super(options);
		this.items             = [];
		this.itemByName        = {};	
		this.options.items   ??= [];
		
		Array.isArray(this.options.items) || mustBe.normalObject(this.options.items);
		assert(!(this.options.items instanceof AbstractItem));
		
		if(!Array.isArray(this.options.items)){
			if(!this.canItemsBeObject) throw new Error(`${this.constructor.name} cant contains items as object`);			
			Object.entries(this.options.items).forEach(([name, item])=>{
				this.push(this.normalizeChildItem(item, name))
			});
		} else {
			this.options.items.forEach(item=>{
				this.push(item);
			})
		}
	}
	static toInstance(opts, name=undefined){
		if(opts instanceof this){
			return opts;
		} else if(opts instanceof AbstractItem){
			assert(!(opts instanceof lib.base.Page));
			return new this({items: [opts], name: name||opts.name});
		} else {
			mustBe.oneOf(typeof(opts), ['function','object', 'string']);
			if(typeof(opts)==='object'){
				Array.isArray(opts) || mustBe.normalObject(opts);
			} 			
			return new this(opts); 
		}
	}
	async getBadge(req, depth=0){
		try{			
			if(this.options.badge!==undefined){
				return depth===0 ? await this.option('badge', req, 'string') : '';
			} else if(this.items.length===1 && this.items[0].getBadge){
				return await this.items[0].getBadge(req, depth+1);
			} else return '';
		} catch(e){
			console.error(e);
			return 'err';
		}
	}
	normalizeOptions(options){
		const type = typeof(options);
		if(type === 'string' || type==='function'){
			return {
				items      : [this.castChildItem(options)],
				name       : options.name || undefined,
				isAutoName : !!options.name, 
			};
		}
		assert.equal(type, 'object');		
		
		if(Array.isArray(options)){
			return {items:options};
		} 		
		if(options instanceof AbstractItem){
			assert(!(options instanceof lib.base.Page));
			assert(options.constructor!==AbstractItem);
			return {items:[options]};
		} 
		assert(!(options instanceof Promise));	
		
		const specKeys = this.getSpecialKeys(options);
		if(specKeys.length===0){
			return {...options, items:[]};
		} 
		if(specKeys.length===1 && specKeys[0]===this.constructor.parentOptionsKey){
			return {...options, items: options[specKeys[0]]};
		}
		return {
			...options,
			items : specKeys.map(key=>lib.createItemByParentOptionsKey(key, options, this))
		}
	}
	onPushed(){
		this.items.forEach(item=>item.onParentPushed());
		super.onPushed();
	}
	onParentPushed(){
		this.items.forEach(item=>item.onParentPushed());
		super.onParentPushed();			
	}
	onBeforeInit(){
		super.onBeforeInit();
		this.items.forEach(item=>item.beforeInit());
	}
	onInit(){
		super.onInit();
		this.items.forEach(item=>item.init());
	}
	castChildItem(opts, name=undefined){
		if(opts instanceof AbstractItem){
			assert(!(opts instanceof lib.base.Page));
			return opts;
		}
		const type = typeof(opts);
		if(type==='string' || type==='function'){
			let res = {html: opts};
			if(type==='function'){
				if(name===undefined && opts.name){
					res.name       = opts.name;
					res.isAutoName = true;
				}
			}
			if(name!==undefined){
				res.name = name;
			}
			return new lib.classes.HTML(res) 
		}	
		assert.equal(type, 'object');
		return new Items(opts);
	}
	setItemName(item, name){
		if(name!==undefined && name!==''){
			const isAutoName = (item.options && item.options.isAutoName) || item.isAutoName; 
			if(item.name!==undefined && item.name!=='' && !isAutoName && name!==item.name){				
				throw new Error(`${this.constructor.name}: items[${name}].name=${item.name}`)
			}
			item.name = name;
			if(item.options && item.options.isAutoName){
				item.options.isAutoName = false;
			}
			if(item.isAutoName){
				item.isAutoName = false;
			}
		}
		return item;
	}
	normalizeChildItem(item, name=undefined){
		item = this.castChildItem(item, name);
		assert(item instanceof AbstractItem);
		assert(item.constructor !== AbstractItem);
		assert(!(item instanceof lib.base.Page));
		
		return this.setItemName(item, name);
	}
	async renderContent(req){
		return await this.renderChilds(req, 'renderBody', '');
	}
	async renderChilds(req, method='renderBody', join=false){
		const res = await Promise.all(this.items.map(item=>item[method](req)));
		return (!join && join!=='') ? res : res.join(typeof(join)==='string' ? join : '');
	}
	
	$isPlainItems(){ return true}
	$neadBeRow(){    return super.$neadBeRow()  || (this.isPlainItems && this.items.find(item=>(item.neadBeRow  && !item.isContentRow)))}
	$neadBeRows(){   return super.$neadBeRows() || (this.isPlainItems && this.items.find(item=>(item.neadBeRows && !item.isContentRows)))}
	
	push(...items){
		assert(!this.wasInit);
		
		if(items.length!==1){
			items.forEach(item=>this.push(item));
			return;
		}
		
		let item = items[0];
		assert(item!==this);
		assert(item!==this.parent);
		assert(!this.items.find(cItem=>cItem===item));
		
		item = this.normalizeChildItem(item);		
		if(item.name!==undefined && item.name!==''){
			assert(!(item.name in this.itemByName) || !this.childNameMustBeUnique);
			this.itemByName[item.name] = item;
		} else if(this.childNameMustBeDefined){
			throw new Error(`${this.constructor.name} items must have name`);
		}
		item.i = this.items.length;
		this.items.push(item);	
		assert(!item.parent || item.parent===this);
		item.parent = this;
		item.onPushed();
	}
};

module.exports = Items;