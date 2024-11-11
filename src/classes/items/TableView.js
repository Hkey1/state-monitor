const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const Tab            = require('./Tab.js');
const AbstractItem   = require('./AbstractItem.js');
const AbstractFilter = require('../filters/AbstractFilter.js');
const lib            = require('../../lib.js');
const tag            = require('../../functions/tag.js');

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
			};
		} else if(options instanceof AbstractFilter){
			options = { filter : options};
		}

		mustBe.normalObject(options);	
		assert(!(options instanceof AbstractItem));

		if(!options.filter && !options.data){
			throw new Error('TableView require filter or data option');
		}
		if(options.filter!==undefined && typeof(options.filter)!=='function' && !(options.filter instanceof AbstractFilter)){
			throw new Error('TableView.filter must be undefined, function, or instanceof AbstractFilter. Given:'+typeof(options.filter));
		}
		
			
		//AbstractFilter
		//options.data || assert.equal(typeof(options.filter), 'function');
		assert(!options.data || Array.isArray(options.data));

		options.items   = [];
		return options;
	}
	async getBadge(req, depth=0){
		try{
			if(this.options.badge!==undefined){
				return depth===0 ? await this.option('badge', req, 'string') : '';
			} else {
				return (await this.nRows(req))+'';
			}
		} catch(e){
			console.error(e);
			return 'err';
		}
	}
	async nRows(req){
		return (await this.getData(req)).length;		
	}
	async getRawData(req){
		return await (this.options.data ? this : this.parent).option('data', req, 'array');
	}
	async getData(req){
		const data = await this.getRawData(req);
		if(!this.options.filter){
			return data;
		} else if (this.options.filter instanceof AbstractFilter){
			return await this.options.filter.filter(data, this, req);
		}
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
	filterColsNames(cols){
		return cols;
	}

	calcDataTablesOpts(dataTables, nRows){
		if(nRows<=10){			
			dataTables.searching   ??= false;
			dataTables.bPaginate   ??= false;
			dataTables.paginate    ??= false;
			dataTables.bInfo       ??= false;
			dataTables.info        ??= false;
			dataTables.___hideNav  = true; 
		}
		return dataTables;
	}
	async renderContent(req, data=undefined){
		try{
			data ||= await this.getData(req);
		} catch(e){
			console.error(e);
			return e+'';
		}
		if(data.length===0){
			return 'no data';
		}
		const wasCol = {};
		const cols   = [];
		data.forEach(row=>{
			Object.keys(row).forEach(col=>{
				if(!(col in wasCol) && row[col]!==undefined && !col.startsWith('_$$$')){
					cols.push(col);
					wasCol[col] = true; 
				}
			});
		})
		const nRows = await this.nRows(req);
		let dataTables = this.options.dataTables ?? this.parent.options.dataTables;
		if(typeof(dataTables)==='object'){
			dataTables = this.calcDataTablesOpts({...dataTables}, nRows);
		}		
		return await this.template('table', req, {
			id         : this.id,
			dataTables, 
			nRows, 
			isDataTablesNavHide: typeof(dataTables)==='object' && dataTables.___hideNav,
			header     : '<tr>'+this.filterColsNames(cols).map(col=>'<th>'+col+'</th>').join('')+'</tr>',
			width      : this.getWidth(),
			body       : data.map(row=>tag(
				'tr', 
				cols.map(col=>'<td>'+((col in row) ? row[col] : '-')+'</td>').join(''),
				row._$$$rowAttrs || {}
			))			
 		});		
	}
	onInit(){
		super.onInit();
		assert(this.parent instanceof lib.base.Table);
	}
};
module.exports = TableView;