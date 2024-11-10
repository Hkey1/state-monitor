const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Tabs         = require('./Tabs.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

class Table extends Tabs {	
	static parentOptionsKey  = 'table'
	static parentOptionsKeys = ['hideTabsHead']	
	async getBadge(req, depth=0){
		try{
			if(this.options.badge!==undefined){
				return depth===0 ? await this.option('badge', req, 'string') : '';
			} else {
				return (await this.option('data', req, 'array')).length + '';
			}
		} catch(e){
			console.error(e);
			return 'err';
		}
	}				
	normalizeOptions(options){
		if(Array.isArray(options) || typeof(options)==='function'){
			options = {data: options};
		}
		mustBe.normalObject(options);
		if(options.table){
			if(Array.isArray(options.table) || typeof(options.table)==='function'){
				assert(!options.data);
				options = {...options, data: options.table, table: undefined};
			} else {
				mustBe.normalObject(options.table);
				assert(options.data   || options.table.data);
				assert(!options.data  || !options.table.data);
				assert(!options.items || !options.table.items);
				assert(!options.tabs  || !options.table.tabs);
				options = {...options, ...options.table, table  : undefined};
			}
		}
		assert(options.data);
		assert(!options.items || !options.tabs);
		
		options.dataTables   ??=  {autoWidth: true}
		options.hideTabsHead ??= 'auto';

		if(options.tabs){
			options.items = options.tabs;
			delete options.tabs;
		}

		assert(typeof(options.items ||= []), 'object')
		Array.isArray(options.items) || mustBe.normalObject(options.items);
		
		const name   = (options.name   || 'all');
		const filter = (options.filter || (()=>true));
		const child  = {name, filter};		
		if(Array.isArray(options.items)){
			options.items = [child, ...options.items]; 
		} else if(!(name in options.items)){
			options.items = {[name] : child, ...options.items};
		}
		//options.badge ??= async (req)=> await this.items[0].option('badge', req, 'string');
		const badKeys = this.getSpecialKeys(options).filter(key=>key!=='items');
		if(badKeys.length){
			throw new Error('Table not suport options keys : '+badKeys.join(', '))
		}
		return super.normalizeOptions(options);
	}
	castChildItem(opts, name=undefined){
		return ((typeof(opts)==='function' || (typeof(opts)==='object' && !Array.isArray(opts) && !(opts instanceof AbstractItem) && opts.filter))
			? new lib.classes.TableView(opts)
			: super.castChildItem(opts, name)
		)	
	}
};

module.exports = Table;