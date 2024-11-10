const assert           = require('node:assert');
const mustBe           = require('hkey-must-be');
const AbstractItem     = require('./AbstractItem.js');

class InfoTable extends AbstractItem{
	static parentOptionsKey  = 'infoTable'
	static parentOptionsKeys = []
	constructor(options){
		super(options);
	}	
	normalizeOptions(options){
		if(typeof(options)==='function' || (typeof(options)==='object' && !Array.isArray(options) && !('info' in options) && !('infoTable' in options) && !(options instanceof AbstractItem))){
			options = {info: options};
		}
		if(options.infoTable){
			assert(!options.info);
			options.info = options.infoTable;
			delete options.infoTable; 
		}
		mustBe.normalObject(options);
		if(typeof(options.info)!=='function'){
			mustBe.normalObject(options.info);
		}
		return options;
	}
	async renderContent(req){
		let data;
		try {
			data = await this.option('info', req, 'object', false);
		} catch(e){
			console.log(e);
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