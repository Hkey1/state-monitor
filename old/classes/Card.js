const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Group        = require('./Group.js');
const AbstractItem = require('./AbstractItem.js');
const Cards        = require('./Cards.js');
const Tab          = require('./Tab.js');

Error.stackTraceLimit = 30;
class Card extends Tab{
	constructor(options){
		mustBe.bool(options.hideCount ??= false);	
		assert(options.parent===undefined || options.parent instanceof Cards);
		options.details ??= '';		
		super(options);
	}
	async render(req){
		return this.template('card', req, {
			header : await this.renderHeader(req),
			body   : await this.renderBody(req),
			width  : this.options.width || this.parent.options.childsWidth,   
		})
	}
	async renderHeader(req){
		return this.name===undefined ? '' : await this.template(req, 'card-header', {
			title       : await this.renderTitle(req), 
			count       : await this._calcCount(req),
			details     : await this.calcOption('details', req, 'string', true),
		});
	}
	async renderTitle(req){
		return await this.template(req, 'card-title', {
			name     : this.name, 
			count    : await this._calcCount(req),
		});
	}	
	async renderBody(req){
		return await this.template(req, 'card-body', {
			content  : (await Promise.all(
				this.items.map(item=>item.render(req))
			)).join(''),
		});
	}
};

module.exports = Card;