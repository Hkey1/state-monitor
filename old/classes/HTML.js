const assert           = require('node:assert');
const mustBe           = require('hkey-must-be');
const AbstractItem     = require('./AbstractItem.js');

class HTML extends AbstractItem{
	constructor(options={}){
		options = (typeof(options)==='string' || typeof(options)==='function') ? {html: options} : options;
		mustBe.oneOf(typeof(options.html), ['function', 'string']);
		
		super(options);
	}
	async renderContent(req){
		return await this.calcOption('html', req, 'string', true);
	}
}
module.exports = HTML;