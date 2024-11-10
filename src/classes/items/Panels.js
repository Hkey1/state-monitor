const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Items        = require('./Items.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Panels extends Items{
	static parentOptionsKey  = 'panels'
	static parentOptionsKeys = ['childsExpand']	
	
	static canItemsBeObject       = true
	static childNameMustBeUnique  = false
	static childNameMustBeDefined = true

	normalizeOptions(options){	
		Array.isArray(options) || mustBe.normalObject(options);
		assert(!(options instanceof AbstractItem));
		
		if(!Array.isArray(options) && options.panels && options.panels.items){
			options = {...options, ...options.panels}
			delete options.panels;
		}
		//console.log(100,options);
		options = (Array.isArray(options) || (options.panels===undefined && options.items===undefined && options.childsExpand===undefined && Object.keys(options).length)) 
			? {items: options} : options;

		//console.log(200,options);
		
		if(!options.items && options.panels){
			options.items = options.panels;
			delete options.panels;
		}
		
		mustBe.oneOf(options.childsExpand ??= 'auto', [true, false, 'auto']);
		this.checkSpecialKeys(options, ['items']);
		
		return options;
	}
	castChildItem(opts, name=undefined){
		return lib.classes.Panel.toInstance(opts, name);
	}
	$isPlainItems(){return true}
	$isContentRow(){return this.neadBeRow}
	async renderContent(req){
		return await this.template('panels', req, {
			content   : await super.renderContent(req),
			neadBeRow : this.neadBeRow,
			id        : this.id,
		});
	}
};
module.exports = Panels;