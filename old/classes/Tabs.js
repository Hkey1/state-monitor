const assert = require('node:assert');
const mustBe = require('hkey-must-be');
const Group  = require('./Group.js');
const AbstractItem  = require('./AbstractItem.js');

let _Tab;
function Tab(){
	return _Tab||= require('./Tab.js');
}

class Tabs extends Group{	
	constructor(options={}){
		mustBe.oneOf(options.hideHeader ??= false, [true, false, 'auto']);
		assert(options.html===undefined);
		options.hideHeader    ??= false;
		options.checkItemName ??= options.hideHeader!==true
		super(options);	
	}
	createChild(opts){
		let items = [opts];
		if(typeof(opts)==='object'){
			if(Array.isArray(opts)){
				items = opts;
			} else if(opts instanceof Tab()){
				return opts;
			} else if(opts instanceof AbstractItem){
				assert(opts.constructor !== AbstractItem)
			} else {
				assert(opts instanceof Promise);
				return new (Tab())(opts);
			}
		}
		return new (Tab())({items});
	}
	normalizeChild(opts, name=undefined){
		assert(opts!==this);
		assert(opts!==this.parent);		
		if(opts instanceof AbstractItem){
			return ((opts instanceof Tab()) 
				? this.setChildName(opts, name)
				: this.createChildAndSetName(opts, name)
			);
		}
		return super.normalizeChild(opts, name);
	}	
	async renderHeader(req){
		return await this.template(req, 'tabs-header', {
			content: (await Promise.all(this.items.map(
				tab=>tab.renderHeader(req)			
			))).join(' ')
		})
	}
	async renderBody(req){
		return await this.template(req, 'tabs-body', {
			content: await super.renderContent(req)
		});		
	}	
	async neadToHideHeader(req){
		return this.options.hideHeader===true || (this.options.hideHeader==='auto' && this.items.length<2);
	}
	async renderContent(req){
		if(await this.neadToHideHeader()){
			return (await Promise.all(this.items.map(tab=>tab.renderContent(req)))).join(' ');
		} else return this.template(req, 'tabs', {
			header : await this.renderHeader(req),
			body   : await this.renderBody(req),
		}); 
	}
};
module.exports = Tabs;