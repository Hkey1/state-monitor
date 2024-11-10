const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Items        = require('./Items.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Tabs extends Items{
	static parentOptionsKey  = 'tabs'
	static parentOptionsKeys = ['hideTabsHead']	
	
	static canItemsBeObject       = true
	static childNameMustBeUnique  = true
	static childNameMustBeDefined = true

	normalizeOptions(options){
		Array.isArray(options) || mustBe.normalObject(options);
		assert(!(options instanceof AbstractItem));
		
		if(!Array.isArray(options) && options.tabs && options.tabs.items){
			options = {...options, ...options.tabs}
			delete options.tabs;
		}

		
		options = (Array.isArray(options) || (options.tabs===undefined && options.items===undefined && options.hideTabsHead===undefined && Object.keys(options).length)) 
			? {items: options} : options;
		
		if(!options.items && options.tabs){
			options.items = options.tabs;
			delete options.tabs;
		}
		
		mustBe.oneOf(options.hideTabsHead ??= false, [true, false, 'auto']);
		this.checkSpecialKeys(options, ['items']);
		
		return options;
	}
	castChildItem(opts, name=undefined){
		return lib.base.Tab.toInstance(opts, name);
	}
	async renderContent(req){
		assert(this.wasInit);
		const content = await super.renderContent(req);
		//console.log('tabs.renderContent', {content, head:await this.renderHead(req)});
		return this.hideTabsHead ? content : await this.template('tabs', req, {
			head : await this.renderHead(req), 
			content, 
		});
	}
	async renderHead(req){
		//console.log('tabs.renderHead', {content:await this.renderChilds(req, 'renderHead', '')});
		return await this.template('tabs-head', req, {
			content: await this.renderChilds(req, 'renderHead', ''),
		})
	}
	$hideTabsHead(){ return this.options.hideTabsHead===true || (this.options.hideTabsHead==='auto' && this.items.length<2) }	
	$isPlainItems(){ return this.hideTabsHead;}
};
module.exports = Tabs;