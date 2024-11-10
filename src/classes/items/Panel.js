const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Items        = require('./Items.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Panel extends Items{
	static parentOptionsKey  = false
	static parentOptionsKeys = []
	constructor(options){
		super(options);
	}
	onInit(){
		super.onInit();
		assert(this.parent instanceof lib.base.Panels || this.parent instanceof lib.classes.Panels)
	}
	$expand(){
		const parentOpt = this.parent.options.childsExpand;
		return this.options.expand ?? (parentOpt==='auto' ? (this.i === 0) : parentOpt);		
	}
	async renderContent(req){
		return this.neadToHideHead ? content : await this.template('panel', req, {
			expand   : this.expand,
			content  : await super.renderContent(req), 
			id       : this.id,
			parentId : this.parent.id,
			name     : this.name,
			fullName : await this.option('fullName', req, 'string', true, true),
			badge    : await this.getBadge(req),
			details  : await this.option('details',  req, 'string', true, true),
			tooltip  : await this.option('tooltip',  req, 'string', true, true),
		});
	}
};
module.exports = Panel;