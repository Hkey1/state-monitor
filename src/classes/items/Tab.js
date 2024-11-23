const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Items        = require('./Items.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Tab extends Items{
	static _options = ['active', 'templateName', 'style', 'tooltip','details', 'fullName', 'hideable'];
	static defaultTemplate = undefined;
	static shortKey  = false
	constructor(options){
		super(options);
		this.options.templateName ??= this.constructor.defaultTemplate; 
		this.divId    = this.id+'-div';
		this.buttonId = this.id+'-btn';		
	}
	async renderTabHead(req){
		return await this.template('tab-head', req, {
			isActive : this.isActive,
			name     : this.name,
			badge    : await this.getBadge(req),
			icon     : await this.getIcon(req),
			fullName : await this.option('fullName', req, 'string', true, true),
			details  : await this.option('details',  req, 'string', true, true),
			tooltip  : await this.option('tooltip',  req, 'string', true, true),
			divId    : this.divId,  
			buttonId : this.buttonId,  
			isInCol  : this.neadBeCol, 
		});
	}
	async renderTabBody(req, content=undefined){
		return await this.template('tab-body', req, {
			isActive  : this.isActive,
			content   : await this.renderBody(req, content), 
			divId     : this.divId,  
			buttonId  : this.buttonId,  
			name      : this.name,
			fullName  : await this.option('fullName', req, 'string', true, true),
			badge     : await this.getBadge(req),
			details   : await this.option('details',  req, 'string', true, true),
			icon      : await this.getIcon(req),
			h         :	this.h,	
		});
	}
	async renderBody(req, content=undefined){
		content ??= await this.renderContent(req);
		if(this.options.templateName!=='tab' && this.options.templateName){
			content = await this.template(this.options.templateName, req, {
				content   : content, 
				isActive  : this.isActive,
				hideable  : this.options.hideable ?? (this.parent.options._active!==true),
				id        : this.id,
				parentId  : this.parent.id,
				name      : this.name,
				fullName  : await this.option('fullName', req, 'string', true, true),
				badge     : await this.getBadge(req),
				details   : await this.option('details',  req, 'string', true, true),
				tooltip   : await this.option('tooltip',  req, 'string', true, true),
				icon      : await this.getIcon(req),
				h         :	this.h,	
			})
		}
		content =  await super.renderBody(req, content);
		return content;
	}
	$isH(){return this.options.templateName==='card' || this.options.templateName==='paragraph'};
	$isActive(){
		const val = this.options.active;
		const res = (val===true 
		    ||  val===this.i 
			|| (val===this.name && this.name) 
			|| (val===undefined && (this.i===0 || !(this.parent instanceof lib.base.Tabs)))
		);		
		return res;
	}
};
module.exports = Tab;