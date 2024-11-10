const assert = require('node:assert');
const mustBe = require('hkey-must-be');
const Tab    = require('./Tab.js');

let Table;
class View extends Tab {
	static normalizeOptions(options){
		if(typeof(options)==='function'){
			const filter = options;
			options = {filter};
			if(filter.name){
				options.name = filter.name;
			}
		}
		return options;
	}
	constructor(options){
		mustBe.notEmptyString(options.name);
		mustBe.syncFunction(options.filter);
		assert(options.table === undefined || options.table instanceof (Table ||= require('./Table.js')))
		mustBe.plainObject(options.cols ??= {});
		
		super(options);
		this.filter = this.options.filter;
	}
	get table(){return this.parent};
	onPushed(){
		assert(this.table instanceof (Table ||= require('./Table.js')))
	}
	async getData(req){
		const data = await this.table.getData(req);
		return  data.map(rawRow=>{
			const row = {...rawRow};
			const res = this.filter(row, data);
			if(!res){
				return null;
			} else if(res===true){
				return row;
			} else {
				assert.equal(typeof(res), 'object');
				assert.equal(res!==null);
				assert(!(res instanceof Promise));
				assert(!(res instanceof Error));
				return res;
			}
			return row;
		}).filter(row=>row!==null);
	}		
	renderData(req, data=undefined){
		return this.table.renderData.call(this, req, data);
	}
	async renderContent(){
		return await this.renderData(req);
	}
	getCount(req){
		return this.table.getCount.call(this, req);
	}
}

module.exports = View;