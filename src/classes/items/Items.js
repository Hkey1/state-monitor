const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Items extends AbstractItem{
	static shortKey   = 'items'
	static shortKeyTo = false	

	static childNameMustBeUnique  = false
	static childNameMustBeDefined = false
	
	get childNameMustBeUnique()  {return this.constructor.childNameMustBeUnique}
	get childNameMustBeDefined() {return this.constructor.childNameMustBeDefined}
	
	static _options          = ['items'];
		
	constructor(options){
		super(options);
		this.items             = [];
		this.itemByName        = {};	
		this.options.items   ??= [];
		
		Array.isArray(this.options.items) || mustBe.normalObject(this.options.items);
		assert(!(this.options.items instanceof AbstractItem));
		
		if(!Array.isArray(this.options.items)){
			Object.entries(this.options.items).forEach(([name, item])=>{
				this.push(this.normalizeChildItem(item, name))
			});
		} else {
			this.options.items.forEach(item=>{
				this.push(item);
			})
		}
	}
	normalizeItems(options){
		mustBe.normalObject(options);
		const itemsKeys = this.getChildsKeys(options);
		if(options.items){
			Array.isArray(options.items) || mustBe.normalObject(options);
			if(itemsKeys.length){
				throw new Error(`Bad options: ${itemsKeys.join(', ')}. Options already have a items`);
			}
		} else if(itemsKeys.length){
			options.items = {};
			itemsKeys.forEach(key=>{
				options.items[key.substring(1)] = options[key];
				delete options[key];
			});
		} else if(this.getSpecialKeys(options).length===0 && Object.keys(options).length!==0){
			const items = {}, opts = {}, map = this.allOptionsMap;
			Object.keys(options).forEach(key=>{
				(((key in map) || key[0]==='_') ? opts : items)[key] = options[key]
			});
			options = {...opts, items};
		}
		return options;
	}
	getChildsKeys(options){
		return Object.keys(options).filter(key=>key[0]==='$')
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
		

		const specKeys = this.getSpecialKeys(options);
		if(specKeys.length!==0 && (specKeys.length!==1 || specKeys[0]!=='items')){
			options.items = specKeys.map(key=>{
				const item = lib.createItemByShortKey(key, options, this);
				delete options[key];
				return item;
			})
		}
		options = this.normalizeItems(options);
		
		return options;
	}
	$iconChild(field='useIconInParents',isFromParent=false, haveField='haveIcon', method='$iconChild', onUndefined=true){
		onUndefined &&= this[field]!==false; 
		if(this[haveField] && (!isFromParent || this[field] || onUndefined)){			
			return this;
		}
		onUndefined &&= this.items.length===1; 
		for(let i=0; i<this.items.length; i++){
			const item = this.items[i];
			if(item[field]!==false){
				const res = ((item instanceof Items) 
					? item[method](field, true, haveField, method, onUndefined) 
					: ((item[haveField] && (item[field]??onUndefined)) ? item : undefined)
				);
				if(res){
					return res;
				}
			}
		}
	}
	$badgeChild(field='useBadgeInParents', isFromParent=false, haveField='haveBadge', method='$badgeChild'){
		return this.$iconChild(field, isFromParent, haveField, method);
	}
	
	async getBadgeOrIcon(badge, req){	
		let   child  = badge ? this.badgeChild : this.iconChild;
		const method = badge ? 'getBadge'      : 'getIcon';
		if(!child){
			return undefined; 
		} else if(child===this){
			return await super[method](req)
		} else {
			return await child[method](req)
		}
	}
	async getIcon(req){	
		return await this.getBadgeOrIcon(false, req);
	}
	async getBadge(req){	
		return await this.getBadgeOrIcon(true, req);
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
		if(type!=='object'){
			throw new Error(this.constructor.name+`: type=${type} opts=${opts} name=${name}`);
		}
		//assert.equal(type, 'object');
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

	addItem(...items){
		return this.push(...items);
	}
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
		return item;
	}
};

module.exports = Items;