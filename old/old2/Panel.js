const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Items        = require('./Items.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Panel extends Items{
	static shortKey  = false
	constructor(options){
		super(options);
	}
	onInit(){
		super.onInit();
		assert(this.parent instanceof lib.base.Panels || this.parent instanceof lib.classes.Panels)
	}
	$expand(){
		const val = this.options.expand;
		return val===true || val===this.i || (val===this.name && this.name) || (val=== undefined && this.i === 0);
	}
	$hideable(){
		return this.parent.options._expand!==true;
	}
	async renderContent(req){
		return await this.template('panel', req, {
			expand    : this.expand,
			hideable  : this.hideable,
			content   : await super.renderContent(req), 
			id        : this.id,
			parentId  : this.parent.id,
			name      : this.name,
			fullName  : await this.option('fullName', req, 'string', true, true),
			badge     : await this.getBadge(req),
			details   : await this.option('details',  req, 'string', true, true),
			tooltip   : await this.option('tooltip',  req, 'string', true, true),
			isInCol   : this.neadBeCol,		
			icon      : await this.getIcon(req),
		});
	}
};
module.exports = Panel;