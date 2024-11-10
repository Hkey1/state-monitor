const assert = require('node:assert');
const mustBe = require('hkey-must-be');
const Group  = require('./Group.js');
const Tabs   = require('./Tabs.js');

class Tab extends Group{
	constructor(options){
		mustBe.bool(options.hideCount     ??= false);
			
		assert(options.parent===undefined || options.parent instanceof Tabs);
		super(options);
	}
	get divId(){return this.id+'-div'}
	get buttonId(){return this.id+'-button'}
	
	async renderHeader(req){
		return await this.template(req, 'tab-header', {
			isActive : this.isActive(req),
			content  : await this.renderTitle(req), 
			divId    : this.divId,  
			buttonId : this.buttonId,  
			count    : await this._calcCount(req),
		});
	}
	async _calcCount(req){
		let fun = undefined; 
		if(this.getCount){
			fun = this.getCount.bind(this);
		} else if(this.items.length===1 && this.items[0].getCount){
			fun = this.items[0].getCount.bind(this.items[0]);
		}
		let count  = undefined;
		if(fun){
			try{
				count = await fun(req);
			} catch(e){
				count = 'err';
				console.error(e);
			}
		}
		return count;
	}
	async renderTitle(req){
		return await this.template(req, 'tab-title', {
			name     : this.name, 
			divId    : this.divId,  
			buttonId : this.buttonId,  
			count    : await this._calcCount(req),
		});
	}
	async renderContent(req){
		return await super.renderContent(req);
	}
	isActive(req){
		return this.num===0;
	}	
	async renderBody(req){
		return await this.template(req, 'tab-body', {
			isActive : this.isActive(req),
			divId    : this.divId,  
			buttonId : this.buttonId,  
			content  : await this.renderContent(),			
		});		
	}
	async render(req){
		return await this.renderBody(req);
	}
}
module.exports = Tab;