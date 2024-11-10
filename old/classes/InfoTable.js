const assert           = require('node:assert');
const mustBe           = require('hkey-must-be');
const AbstractItem     = require('./AbstractItem.js');
const HTML             = require('./HTML.js');
const Table            = require('./Table.js');

class InfoTable extends AbstractItem{
	constructor(options){
		if(typeof(options)==='function' || (typeof(options)==='object' && !Array.isArray(options) && !('data' in options))){
			options = {data: options};
		}
		
		assert(typeof(options)==='object');
		assert(typeof(options.data)==='function' || typeof(options.data)==='object');
		assert(!Array.isArray(options.data));		
		super(options);
	}	
	async getData(req){
		return await this.calcOption('data', req, 'object', false);
	}
	async renderContent(req){
		let data;
		try {
			data = await this.getData(req);
		} catch(e){
			console.log(e);
			return e+''
		}
		const rowsPromises = Object.entries(data).map(async ([key, val])=>{
			val = Array.isArray(val) ? val : [val];
			const isSubHeader = key[0]==='$';
			key = isSubHeader ? key.substring(1) : key;
			const сellsPromises = [
				this.template(req, 'infoTable-cell', {isSubHeader, cellNum:0, content:key, key, val, isKey:true}),
				...val.map((cur, j)=>this.template(req, 'infoTable-cell', {isSubHeader, cellNum:j+1, content:cur, key, val, isKey:false}))
			]
			return await this.template(req, 'infoTable-row', {isSubHeader, key, val, 
				content:(await Promise.all(сellsPromises)).join('')
			});
		});
		return await this.template(req, 'infoTable', {
			content: (await Promise.all(rowsPromises)).join('')
		});
	}	
};

module.exports = InfoTable;