const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const Tab            = require('./Tab.js');
const TableView      = require('./TableView.js');
const AbstractItem   = require('./AbstractItem.js');
const AbstractFilter = require('../filters/AbstractFilter.js');
const lib            = require('../../lib.js');
const pie            = require('../../functions/pie.js');
const calcPieColors  = require('../../functions/calcPieColors.js');
const histo          = require('../../functions/histo.js');
const getKey         = require('../../functions/getKey.js');
const GroupBy        = require('../filters/GroupBy.js');

class TableViewGroupBy extends TableView{
	normalizeOptions(options){
		if(typeof(options)==='object' && options.constructor===Object && options.groupBy){
			options = {...options, filter : options};
		}
		if(typeof(options)==='object' && options.filter.constructor===Object && options.filter.groupBy){
			options.filter = new GroupBy(options.filter.groupBy, options.filter);
		}

		let {colors} = options;
		if(colors){
			if(!Array.isArray(colors)){
				colors instanceof Map || mustBe.normalObject(colors);
				colors = Object.values(colors);
			}
			assert(colors.length);
			colors.forEach(color=>mustBe.notEmptyString(color));
		}
		mustBe.oneOf(options.showHisto,        [true, false, undefined]);
		mustBe.oneOf(options.showPie,          [true, false, undefined]);
		mustBe.oneOf(options.showEmptyRows,    [true, false, undefined]);
		
		options.showHisto     ??= !!options.filter.ranges;
		options.showPie       ??= true;
		options.showEmptyRows ??= options.showHisto;
		
		return super.normalizeOptions(options);
	}
	$haveIcon(){
		return true;
	}
	onInit(){
		super.onInit();
		const isFirstPie = this.parent.items.filter(item=>item instanceof TableViewGroupBy)[0] === this;
		if(isFirstPie){
			['colors'].forEach(name=>{
				this.options[name] ??= this.parent.options[name]
			})
		}
	}	
	async getIcon(req, data=undefined){	
		if('icon' in this.options){
			return await this.option('icon', req, 'string', true, true);
		}
		if(this.i===0 && this.items.length===1 && 'icon' in this.parent.options){
			return await this.parent.option('icon', req, 'string', true, true);
		}
		try{
			data ||= await this.getData(req);
		} catch(e){
			console.error(e);
			return 'bug';
		}
		if(!data || data.length===0){
			return 'ban';
		}
		return this.renderPie(data, {classes: 'sMon-pie-icon'});
	}
	async getData(req){
		let data = this.addColors(await super.getData(req));
		data = data.map(row=>({...row}));
		data.forEach((row,i)=>{
			const id      = `${this.id}-${i}`;
			const classes = `pie-segment pie-segment-${id}`;
			const attrs   = {'data-pie-segment-id' : id, 'class':classes};
			row._$$$pathAttrs = attrs;
			row._$$$rowAttrs  = attrs;
		});
		
		return data;
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
		const pieWidth = this.options.pieWidth||3;
		let content = await super.renderContent(req, data.map((row,i)=>{
			row = {...row};//background-color: ${row.color}
			row.color = `<div style="width: 20px; height:20px;">
				${this.renderPie(data, {hideNot :row.name||i})}
			</div>`;
			return row;
		}).filter(row=>this.options.showEmptyRows || row.count!==0));
		if(this.options.showPie || this.options.showHisto){
			content = (await Promise.all([
				this.template('col', req, {content: this.renderCharts(data), width:pieWidth, classes: 'sMon-TableViewGroupBy-pieCol'}),
				this.template('col', req, {content, width:12-pieWidth}),
			])).join('');
			content = this.template('row', req, {content, classes: 'sMon-TableViewGroupBy-row'});
		}
		return content;
	}
	calcHistoColors(){
		const {filter} = this.options;
		if(filter.ranges && filter.ranges.length && !filter.ranges.find(range=>!range.color)){
			return Object.fromEntries(filter.ranges.map(range=>[range.name, range.color]))
		}
	}
	addColors(data){
		const colors = this.options.colors || this.calcHistoColors() || calcPieColors(data);
		const keyCol = this.options.filter.keyCol;

		if(!Array.isArray(colors)){
			this.filter.names ??= Object.keys(colors);
		}
		
		if(Array.isArray(colors)){
			if(colors.length < data.length){
				throw new Error(`Too few colors: Need (data.length)=${data.length}. Gain (options.color.length)={$this.options.colors.length} colors.`);
			} 
			return data.map((row,i)=>({color:colors[i], ...row})); 
		} else {
			data.forEach(row=>{
				const key = row[keyCol];
				if(!getKey(this.options.colors, key)){
					throw new Error(`Missing color name for '${key}'`);							
				}
			});
			return data.map(row=>({color:getKey(colors, row[keyCol]), ...row})); 
		}
	}
	renderCharts(data, opts={}){
		return (''
			+(this.options.showPie   ? this.renderPie(data, opts) + '<br /><br />' : '')
			+(this.options.showHisto ? this.renderHisto(data, opts) : '')
		);
	}	
	toChartData(data){
		const keyCol = this.options.filter.keyCol; 
		return data.map(row=>({
			name : keyCol+'='+row[keyCol],
			color: row.color,
			count: row.count,
			pathAttrs : row._$$$pathAttrs,
		}));
	};
	renderPie(data, opts={}){
		const keyCol = this.options.filter.keyCol; 
		return pie(this.toChartData(data), opts);
	}
	renderHisto(data, opts={}){
		const keyCol = this.options.filter.keyCol; 
		return histo(this.toChartData(data), opts);
	}
	filterColsNames(cols, data){
		const haveNum = (data[0] && data[0].num!==undefined) ? 1 : 0;
		cols = [...cols];
		cols[0] = '';
		if(haveNum){
			cols[1] = '#';
		}
		cols[3+haveNum] = '%';		
		return cols;
	}
	calcDataTablesOpts(dataTables, data){
		const haveNum = (data[0] && data[0].num!==undefined) ? 1 : 0;
		dataTables.order      ??= [[haveNum ? 1 : 2, haveNum ? 'asc' : 'desc']];		
		dataTables.columnDefs ??= [];
		
		dataTables.columnDefs.push({
			"targets": 0,
			"orderable": false,
			"width": '25px'
		});
		if(haveNum){
			dataTables.columnDefs.push({
				"targets": 1,
				"width": '25px'
			});
		}
		dataTables.columnDefs.push({
			"targets": 2+haveNum,
			"width": '25px'
		});
		dataTables.columnDefs.push({
			"targets": 3+haveNum,
			"width": '25px'
		});
		return super.calcDataTablesOpts(dataTables, data);
	}
};
module.exports = TableViewGroupBy;