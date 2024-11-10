const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Items        = require('./Items.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Tab extends Items{
	static parentOptionsKey  = false
	static parentOptionsKeys = []
	constructor(options){
		super(options);
		this.divId    = this.id+'-div';
		this.buttonId = this.id+'-btn';		
	}
	onInit(){
		super.onInit();
		assert(this.parent instanceof lib.base.Tabs || this.parent instanceof lib.base.Tabs)
	}
	$hideTabsHead(){  return this.options.hideTabsHead ?? this.parent.hideTabsHead}
	$isAnyParentRow(){  return this.hideTabsHead ? super.$isAnyParentRow() : false}
	$isAnyParentRows(){ return this.hideTabsHead ? super.$isAnyParentRows(): false}
	async renderBody(req, content=undefined){
		content ??= await this.renderContent(req);
		content   = await super.renderBody(req, content);
		return this.neadToHideHead ? content : await this.template('tab-body', req, {
			isActive : this.isActive,
			content  : content, 
			divId    : this.divId,  
			buttonId : this.buttonId,  
		});
	}
	$isActive(){
		return this.options.isActive ?? (this.i === 0);		
	}
	async renderHead(req){
		return await this.template('tab-head', req, {
			isActive : this.isActive,
			name     : this.name,
			badge    : await this.getBadge(req),
			fullName : await this.option('fullName', req, 'string', true, true),
			details  : await this.option('details',  req, 'string', true, true),
			tooltip  : await this.option('tooltip',  req, 'string', true, true),
			divId    : this.divId,  
			buttonId : this.buttonId,  
		});
	}
};
module.exports = Tab;