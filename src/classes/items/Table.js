const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const Tab            = require('./Tab.js');
const AbstractItem   = require('./AbstractItem.js');
const lib            = require('../../lib.js');
const AbstractFilter = require('../filters/AbstractFilter.js');
const GroupBy        = require('../filters/GroupBy.js');
const tag            = require('../../functions/tag.js');

class Table extends Tab {	
	static _options = ['data', 'dataTables', 'filter'];

	static shortKey  = 'table'
	normalizeOptions(options){
		if(Array.isArray(options)){
			options = {data: options};
		} else if(typeof(options)==='function' || options instanceof AbstractFilter){
			options = {filter: options};
		}
		mustBe.normalObject(options);
		options.dataTables ??= {};		
		this.checkSpecialKeys(options, []);
		return options;
	}
	async getRawData(req){
		return await (this.options.data ? this : this.parent).option('data', req, 'array');
	}
	async getData(req){
		let data = await this.getRawData(req);
		assert(Array.isArray(data));
		
		if(!this.options.filter){
			return data;
		} else if (this.options.filter instanceof AbstractFilter){
			data = await this.options.filter.filter(data, this, req);
			assert(Array.isArray(data));
			return data;
		} else return data.map((rawRow, i)=>{
			const row = {...rawRow};
			const res = this.options.filter(row, req, data, i, this);
			if(!res){
				return null;
			} else if(res===true){
				return row;
			} else {
				mustBe.normalObject(res);
				return res;
			}
		}).filter(row=>row!==null);
	}
	$haveBadge(){return true}
	
	async getBadge(req){
		try{
			if(this.options.badge!==undefined){
				return await super.getBadge(req);
			} else {
				return (await this.nRows(req)) + '';
			}
		} catch(e){
			console.error(e);
			return 'err';
		}
	}				
	async nRows(req){
		return (await this.getData(req)).length
	}
	filterColsNames(cols, data){
		return cols;
	}
	calcDataTablesOpts(dataTables, data){
		if(data.length<=10){			
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
		let dataTables = this.options.dataTables;
		dataTables = dataTables===true ? {} : dataTables;
		if(typeof(dataTables)==='object'){
			dataTables = this.calcDataTablesOpts({...dataTables}, data);
		}		
		return await this.template('table', req, {
			id         : this.id,
			dataTables, 
			isDataTablesNavHide: typeof(dataTables)==='object' && dataTables.___hideNav,
			header     : '<tr>'+this.filterColsNames(cols, data).map(col=>'<th>'+col+'</th>').join('')+'</tr>',
			width      : this.options.width,
			body       : data.map(row=>tag(
				'tr', 
				cols.map(col=>'<td>'+((col in row) ? row[col] : '-')+'</td>').join(''),
				row._$$$rowAttrs || {}
			)).join('')			
 		});		
	}
};

module.exports = Table;