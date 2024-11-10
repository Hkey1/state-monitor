const assert    = require('node:assert');
const mustBe    = require('hkey-must-be');
const Group     = require('./Group.js');
const Tabs      = require('./Tabs.js');
const splitOpts = require('../functions/splitOptions.js');


let _View, _Tab;

const Tab  = ()=>(_Tab  ||= require('./Tab.js'));
const View = ()=>(_View ||= require('./View.js'));

class Table extends Tabs {	
	constructor(options={}){		
		if(Array.isArray(options) || typeof(options)==='function'){
			options = {data: options};
		}
		options.dataTables ??= {
			autoWidth: true
		}
		assert(Array.isArray(options.data) || typeof(options.data)==='function');
		options.hideHeader ??= 'auto';
		options.items      ??= [];

		const [viewOpts, thisOpts] = splitOpts(options, {
			filter : ()=>true, 
			name   : 'all',
		});
		
		super(thisOpts);				
		this.view  = new (View())(viewOpts);
		super.push(this.view);
	}
	createChild(opts){
		if(opts.filter){
			const Class = View();
			return new Class(opts);
		} else {
			return super.createChild(opts);
		}
	}
	normalizeChild(opts, name=undefined){
		if(typeof(opts)==='function'){
			return this.createChild({
				name   : name || opts.name,
				filter : opts,
			});
		}
		return super.normalizeChild(opts);
	}
	async getData(req){
		if(typeof(this.options.data)!=='function'){
			return this.options.data;
		}
		//TODO: cache в calcOption
		const cache = (req.sMon.tableCache||={});
		cache[this.id] ||= this.calcOption('data', req, 'array');
		return await cache[this.id];
	}
	async renderData(req, data=undefined){
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
				if(!(col in wasCol)){
					cols.push(col);
					wasCol[col] = true; 
				}
			});
		})
		
		return await this.template(req, 'table', {
			id         : this.id,
			dataTables : this.options.dataTables, 
			header     : '<tr>'+cols.map(col=>'<th>'+col+'</th>').join('')+'</tr>',
			body       : data.map(row=>{
				return ('<tr>'
					+cols.map(col=>'<td>'+((col in row) ? row[col] : '-')+'</td>').join('')
				+'</tr>')
			}).join('')
 		});		
	}
	async getCount(req){
		return (await this.getData(req)).length;
	}
	async renderContent(req){
		let data;
		try{
			data ||= await this.getData(req);
		} catch(e){
			console.error(e);
			return e+'';
		}
		return await (this.tabs ? super.renderContent(req) : this.renderData(req, data));
	}
};
module.exports = Table;