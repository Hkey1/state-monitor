const assert           = require('node:assert');
const mustBe           = require('hkey-must-be');
const AbstractItem     = require('./AbstractItem.js');
const HTML             = require('./HTML.js');

class Alert extends HTML{
	static parentOptionsKey = 'alert'	
	async renderContent(req){
		return await this.template('alert', req, {
			content   : await super.renderContent(req),
			type      : (await this.option('type', req, 'string', true, true))||'danger', 
		});
	}
}
module.exports = Alert