const assert           = require('node:assert');
const mustBe           = require('hkey-must-be');
const AbstractItem     = require('./AbstractItem.js');

class InfoTable extends AbstractItem{
	static shortKey   = 'infoTable'
	static shortKeyTo = false
	
	static _options = ['data'];
	constructor(options){
		super(options);
	}	
	normalizeOptions(options){
		if(typeof(options)==='function' || (typeof(options)==='object' && !Array.isArray(options) && !('data' in options) && !(options instanceof AbstractItem))){
			options = {data: options};
		}
		mustBe.normalObject(options);
		if(typeof(options.data)!=='function'){
			mustBe.normalObject(options.data);
		}
		return options;
	}
	async renderContent(req){
		let data;
		try {
			data = await this.option('data', req, 'object', false);
		} catch(e){
			console.error(e);
			return e+''
		}
		const rowsPromises = Object.entries(data).map(async ([key, val])=>{
			val = Array.isArray(val) ? val : [val];
			const isSubHeader = key[0]==='$';
			key = isSubHeader ? key.substring(1) : key;
			const сellsPromises = [
				this.template('infoTable-cell', req, {isSubHeader, cellNum:0, content:key, key, val, isKey:true}),
				...val.map((cur, j)=>this.template('infoTable-cell', req, {isSubHeader, cellNum:j+1, content:cur, key, val, isKey:false}))
			]
			return await this.template('infoTable-row', req, {isSubHeader, key, val, 
				content:(await Promise.all(сellsPromises)).join('')
			});
		});
		return await this.template('infoTable', req, {
			content: (await Promise.all(rowsPromises)).join('')
		});
	}	
};

module.exports = InfoTable;