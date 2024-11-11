const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const Tab            = require('./Tab.js');
const TableView      = require('./TableView.js');
const AbstractItem   = require('./AbstractItem.js');
const AbstractFilter = require('../filters/AbstractFilter.js');
const lib            = require('../../lib.js');
const calcPieHTML    = require('../../functions/calcPieHTML.js');
const calcPieColors  = require('../../functions/calcPieColors.js');
const getKey         = require('../../functions/getKey.js');


class TableViewGroupBy extends TableView{
	normalizeOptions(options){
		let {colors} = options;
		if(colors){
			if(!Array.isArray(colors)){
				colors instanceof Map || mustBe.normalObject(colors);
				colors = Object.values(colors);
			}
			assert(colors.length);
			colors.forEach(color=>mustBe.notEmptyString(color));
		}
		mustBe.oneOf(options.usePieAsPageIcon, [true, false, undefined]);
		return super.normalizeOptions(options);
	}
	onInit(){
		super.onInit();
		const isFirstPie = this.parent.items.filter(item=>item instanceof TableViewGroupBy)[0] === this;
		if(isFirstPie){
			['usePieAsPageIcon', 'colors'].forEach(name=>{
				this.options[name] ??= this.parent.options[name]
			})
		}
		
		if(this.options.usePieAsPageIcon){
			const page = this.parents.find(parent=>parent instanceof lib.base.Page)
			page.options.icon ??= req=>this.getIcon(req);
		}
	}
	async getIcon(req, data=undefined){			
		const sup = await super.getIcon(req);
		if(sup){
			return sup;
		}
		try{
			data ||= await this.getData(req);
		} catch(e){
			console.error(e);
			return '';
		}
		return this.renderPie(data, {classes: 'sMon-pie-icon'});
	}
	
	async getData(req){
		return this.addColors(await super.getData(req));
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
			</div>`
			return row;
		}));
		content = (await Promise.all([
			this.template('col', req, {content: this.renderPie(data), width:pieWidth, classes: 'sMon-TableViewGroupBy-pieCol'}),
			this.template('col', req, {content, width:12-pieWidth}),
		])).join('');
		content = this.template('row', req, {content, classes: 'sMon-TableViewGroupBy-row'});
		return content;
	}
	addColors(data){
		const colors = this.options.colors || calcPieColors(data);
		const keyCol = this.options.filter.keyCol;
		
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
	renderPie(data, opts={}){
		const keyCol = this.options.filter.keyCol; 
		return calcPieHTML(data.map(row=>({
			name : keyCol+'='+row[keyCol],
			color: row.color,
			count: row.count,
		})), opts);
	}
	filterColsNames(cols){
		cols = [...cols];
		cols[0] = '';
		return cols;
	}
	calcDataTablesOpts(dataTables, nRows){
		dataTables.order      ??= [[2, 'desc']];		
		dataTables.columnDefs ??= [{
			"targets": 0,
			"orderable": false,
			"width": '25px'
		}];
		return super.calcDataTablesOpts(dataTables, nRows);
	}
};
module.exports = TableViewGroupBy;