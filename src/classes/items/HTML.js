const assert           = require('node:assert');
const mustBe           = require('hkey-must-be');
const AbstractItem     = require('./AbstractItem.js');
const lib              = require('../../lib.js');

class HTML extends AbstractItem{
	static parentOptionsKey = 'html'
	normalizeOptions(options){
		assert(!(options instanceof Promise));
		assert(!(options instanceof AbstractItem));
		assert(!(Array.isArray(options)));

		options = (typeof(options)==='string' || typeof(options)==='function') ? {html: options} : options;

		assert.equal(typeof(options), 'object');
		mustBe.oneOf(typeof(options.html), ['function', 'string']);
		assert(!(options.items));
		
		const badKeys = this.getSpecialKeys(options).filter(key=>key!=='html');
		if(badKeys.length){
			throw new Error('HTML not suport options keys : '+badKeys.join(', '))
		}
		return options;
	}
	async renderContent(req){
		return await this.option('html', req, 'string', true);
	}
	
}
module.exports = HTML;