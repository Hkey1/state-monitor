const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const lib            = require('../../lib.js');
const isColWidth     = require('../../functions/isColWidth.js');
const Items          = require('./Items.js');
const AbstractItem   = require('./AbstractItem.js');


class Row extends Items{
	static shortKey       = 'row'
	static childClassName = 'Col';
	static templateName   = 'row'

	static _options   = [
		'width', 
	];
	normalizeOptions(options){
		if(typeof(options)==='object' && !Array.isArray(options)){
			if(isColWidth(options.width)){
				throw new Error(this.constructor.name+' not suport col width='+options.width); 
			}
		} 
		return super.normalizeOptions(options);
	}
	$isContentRow(){return true};
	$neadBeRows(){return true};
	$neadBeRow(){return true};
	$neadBeCol(){return false};
	castChildItem(opts, name=undefined){
		//console.log(this.constructor.name, 'castChildItem', opts)
		const childName = this.constructor.childClassName;
		const Child     = lib.classes[childName];
		
		if(opts instanceof AbstractItem){
			assert(!(opts instanceof lib.base.Page));
			if(opts instanceof lib.base[childName]){
				return opts;
			} else {
				return new Child({items: [opts]}) 
			}
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
			return new Child({items: [new lib.classes.HTML(res)]}) 
		}	
		if(type!=='object'){
			throw new Error(this.constructor.name+`: type=${type} opts=${opts} name=${name}`);
		}
		//assert.equal(type, 'object');
		return new Child(opts);
	}
	async renderContent(req, content=undefined){
		content ??= await super.renderContent(req);
		return await this.template(this.constructor.templateName, req, {
			content,
			width: this.options.width,
		})
	}
}; 
module.exports = Row;