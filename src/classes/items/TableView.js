const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Tab          = require('./Tab.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');


class TableView extends Tab{
	static parentOptionsKey  = false
	static parentOptionsKeys = []	

	normalizeOptions(options){
		const type = typeof(options);
		if(type==='function'){
			options = {
				filter     : options,
				isAutoName : !!options.name,
				name       : options.name||undefined,
			}
		} 
		mustBe.normalObject(options);	
		assert(!(options instanceof AbstractItem));

		options.data || assert.equal(typeof(options.filter), 'function');
		assert(!options.data || Array.isArray(options.data));

		options.items   = [];
		return options;
	}
	async getBadge(req, depth=0){
		try{
			if(this.options.badge!==undefined){
				return depth===0 ? await this.option('badge', req, 'string') : '';
			} else {
				return (await this.getData(req)).length+'';
			}
		} catch(e){
			console.error(e);
			return 'err';
		}
	}
	async getData(req){
		const data = await (this.options.data ? this : this.parent).option('data', req, 'array');
		return data.map((rawRow, i)=>{
			const row = {...rawRow};
			const res = this.options.filter(row, req, data, i, this);
			if(!res){
				return null;
			} else if(res===true){
				return row;
			} else {
				assert.equal(typeof(res), 'object');
				assert(!(res instanceof Promise));
				return res;
			}
		}).filter(row=>row!==null);
	}
	async renderContent(req, data=undefined){
		try{
			data ||= await this.getData(req);
		} catch(e){
			console.error(e);
			return e+'';
		}
		
		const wasCol = {};
		const cols   = [];
		data.forEach(row=>{
			Object.keys(row).forEach(col=>{
				if(!(col in wasCol) && row[col]!==undefined){
					cols.push(col);
					wasCol[col] = true; 
				}
			});
		})
		return await this.template('table', req, {
			id         : this.id,
			dataTables : this.options.dataTables ?? this.parent.options.dataTables, 
			header     : '<tr>'+cols.map(col=>'<th>'+col+'</th>').join('')+'</tr>',
			width      : this.getWidth(),
			body       : data.map(row=>{
				return ('<tr>'
					+cols.map(col=>'<td>'+((col in row) ? row[col] : '-')+'</td>').join('')
				+'</tr>')
			}).join('')
 		});		
	}
	onInit(){
		super.onInit();
		assert(this.parent instanceof lib.base.Table);
	}
};
module.exports = TableView;