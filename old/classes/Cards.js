const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Group        = require('./Group.js');
const AbstractItem = require('./AbstractItem.js');

let _Card;
function Card(){
	return _Card||require('./Card.js');
}

class Cards extends Group{
	constructor(options){
		mustBe.int(options.childsWidth    ??= 3);
		mustBe.bool(options.checkItemName ??= false);	
		super(options);
	}
	createChild(opts){
		let items = [opts];
		if(typeof(opts)==='object'){
			if(Array.isArray(opts)){
				items = opts;
			} else if(opts instanceof Card()){
				return opts;
			} else if(opts instanceof AbstractItem){
				assert(opts.constructor !== AbstractItem)
			} else {
				assert(!(opts instanceof Promise));
				return new (Card())(opts);
			}
		}
		return new (Card())({items});
	}	
	async renderContent(req){
		const res =  this.template(req, 'cards', {
			content : (await Promise.all(this.items.map(card=>card.render(req)))).join(''),
		})
		return res;
	}
}
module.exports = Cards;