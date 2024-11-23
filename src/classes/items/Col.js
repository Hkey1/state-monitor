const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const lib            = require('../../lib.js');
const Items          = require('./Items.js');

class Col extends Items{
	static shortKey       = 'col'
	static templateName   = 'col'
	static _options   = [
		'width', 
	];
	$isContentRows(){return false};
	$isContentRow(){return false};
	$isContentCol(){return true};
	$neadBeRows(){return false};
	$neadBeRow(){return false};
	$neadBeCol(){return true};
	async renderContent(req, content=undefined){
		content ??= await super.renderContent(req);
		return await this.template(this.constructor.templateName, req, {
			content,
			width: this.options.width,
		})
	}
}; 
module.exports = Col;