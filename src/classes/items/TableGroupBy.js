const assert         = require('node:assert');
const smartRound     = require('smart-round')
const mustBe         = require('hkey-must-be');
const Table          = require('./Table.js');
const AbstractItem   = require('./AbstractItem.js');
const lib            = require('../../lib.js');
const AbstractFilter = require('../filters/AbstractFilter.js');
const GroupBy        = require('../filters/GroupBy.js');
const tag            = require('../../functions/tag.js');
const pie            = require('../../functions/pie.js');
const histo          = require('../../functions/histo.js');
const calcPieColors  = require('../../functions/calcPieColors.js');
const getKey         = require('../../functions/getKey.js');

const rounder        = smartRound(6, 0, 6)

class TableGroupBy extends Table {	
	static shortKey = 'tableGroupBy'
	static _options = ['colors', 'showHisto', 'showPie', 'showStats', 'chartsWidth', 'statsWidth'];

	normalizeOptions(options){
		if(typeof(options)==='object'){
			mustBe.normalObject(options);
			if(options instanceof GroupBy){
				options = {filter: options};
			} else {
				assert(!(options instanceof AbstractFilter));
				if(!options.filter && options.groupBy){
					options.filter = {};
					['groupBy', 'ranges', 'nameCol'].forEach(key=>{
						if(key in options){
							options.filter[key] = options[key];
							delete options[key];
						}
					});
				}
			}
			if(options.filter && !(options instanceof GroupBy)){
				mustBe.normalObject(options.filter);
				assert(!(options.filter instanceof AbstractFilter));
				mustBe.notEmptyString(options.filter.groupBy);
				options.filter = new GroupBy(options.filter);
			}
		}

		mustBe.oneOf(options.showHisto,        [true, false, undefined]);
		mustBe.oneOf(options.showPie,          [true, false, undefined]);
		mustBe.oneOf(options.showStats,        [true, false, undefined]);

		options.chartsWidth === undefined || typeof(options.chartsWidth)==='number' || mustBe.notEmptyString(options.chartsWidth);
		options.statsWidth  === undefined || typeof(options.statsWidth)==='number'  || mustBe.notEmptyString(options.statsWidth);

		!options.colors || Array.isArray(options.colors) || mustBe.normalObject(options.colors);

		const ranges = options.filter ? options.filter.ranges : undefined;

		options.showPie     ??= true;
		options.showHisto   ??= !!ranges;
		options.showStats   ??= !!ranges;
		options.chartsWidth ??= 3;
		options.statsWidth  ??= 2;
		
		if(ranges){
			let wasColor=false, wasNotColor=false;
			options.filter.ranges.forEach(range=>{
				if(range.color){
					wasColor    = true;
				} else {
					wasNotColor = true;
				}
			})
			if(wasColor){
				if(options.colors) throw new Error('options.colors && color in ranges')
				if(wasNotColor)	   throw new Error('Either all ranges must have color or none of them must have color');
				options.colors = Object.fromEntries(options.filter.ranges.map(range=>[range.name, range.color]))
			} else if(options.colors){
				if(Array.isArray(options.colors) || options.colors.length<ranges.length){
					throw new Error(`${options.colors.length} colors < ${ranges.length} ranges`)
				} else {
					const missColors = ranges.filter(range => !(range.name in options.colors));
					if(missColors.length){
						throw new Error(`Cant find color for ranges: `+missColors.map(range=>`'${range.name}'`).join(', '))
					}
				}
			}
		}
		return super.normalizeOptions(options);
	}
	$haveIcon()     {return true;}
	async nRows(req){return (await this.getData(req)).filter(row=>row.count!==0).length + ''}
	async getIcon(req){	
		if('icon' in this.options){
			return await this.option('icon', req, 'string', true, true);
		}
		try{
			const data = await this.getData(req);
			if(!data || data.length===0){
				return 'ban';
			}
			return this.renderPie(data, {classes: 'sMon-pie-icon'});
		} catch(e){
			console.error(e);
			return 'bug';
		}
	}
	async getData(req){
		let data = this.addColors(await super.getData(req));
		data.forEach((row,i)=>{
			const id      = `${this.id}-${i}`;
			const classes = `pie-segment pie-segment-${id}`;
			const attrs   = {'data-pie-segment-id' : id, 'class':classes};
			row._$$$pathAttrs = attrs;
			row._$$$rowAttrs  = {...attrs};
		});		
		return data;
	}
	addColors(data){
		const colors = this.options.colors || calcPieColors(data);

		assert(Array.isArray(data));
		data.forEach(row=>mustBe.normalObject(row));
		function addColor(row, color){
			return {color, ...row};
		}
		
		
		if(Array.isArray(colors)){
			if(colors.length < data.length) throw new Error(`To few colors. Need ${data.length}. Gain: ${data.colors}`);
			data = data.map((row,i)=>addColor(row, colors[i]));
		} else {
			const nameCol = this.options.filter.nameCol;
			mustBe.normalObject(colors);
			mustBe.notEmptyString(nameCol);
			
			data = data.map(row=>{
				mustBe.normalObject(row);
				let name = row[nameCol];
				if(!(nameCol in row)) throw new Error('row not have col: '+nameCol);
				if(!name in colors) throw new Error(`Cant find color for '${name}'`)
				return addColor(row, colors[name])
			});
		}
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
		const chartsWidth = this.options.chartsWidth||3;
		const statsWidth  = this.options.statsWidth ||2;
		const showCharts  = this.options.showPie || this.options.showHisto
		const showStats   = this.options.showStats;
		
		let content = await super.renderContent(req, data.map((row,i)=>{
			row = {...row};//background-color: ${row.color}
			row.color = `<div style="width: 20px; height:20px;">
				${this.renderPie(data, {hideNot :row.name||i})}
			</div>`;
			delete row.to;
			return row;
		}).filter(row=>this.options.showEmptyRows || row.count!==0));
		if(showCharts || showStats){
			let mainWidth = 12 - (showCharts ? chartsWidth : 0) - (showStats ? statsWidth : 0);
			content = (await Promise.all([
				showCharts ? this.template('col', req, {content: await this.renderCharts(req, data), width:chartsWidth, classes: 'sMon-TableViewGroupBy-pieCol'}) : '',
				this.template('col', req, {content, width:mainWidth}),
				showStats  ? this.template('col', req, {content: await this.renderStats(req, data), width:statsWidth}) : '',
			])).join('');
			content = this.template('row', req, {content, classes: 'sMon-TableViewGroupBy-row'});
		}
		return content;
	}
	async renderCharts(req, data, opts={}){
		return (''
			+(this.options.showPie   ? await this.renderPie(data, opts) + '<br /><br />' : '')
			+(this.options.showHisto ? await this.renderHisto(data, opts) : '')
		);
	}	
	async renderStats(req, data, opts={}){
		data = data.sort((a,b)=>a.to-b.to);
		const rawData = await this.getRawData(req);
		const col     = this.options.filter.groupBy;
		const arr0    = rawData.map(row=>row[col]*1);
		const arr     = arr0.filter(val=>val!==null && val!==undefined && !isNaN(val)).sort((a,b)=>a-b);
		if(arr.length===0){
			return '';
		}
		const sum  = arr.reduce((acc, val)=>acc+val, 0);
		const len  = arr.length;
		const mean = sum/len;
		const v    = arr.reduce((acc, val)=>acc + (val-mean)*(val-mean), 0);
		
		const max = Math.max(...arr);
		const min = Math.min(...arr);
		
		const rows    = {
			rows   : arr.length+'/'+arr0.length,
			min, max, 
			mean   : sum/len,
			median : arr[Math.ceil(len/2)-1],
			'σ'    : Math.sqrt(v/len),
  		};
		
		const renderRow = ([name, val])=>{
			let row; 
			let td  = `<td>${val}</td>`;
			if(typeof(val)==='number'){
				row         = name!=='σ' ? data.find(row=>val<=row.to) : undefined;
				const color = (row ? row.color : undefined) || 'gray';
				const mw    = 45;
				const h     = 2;
				const w     = mw*val/max;
				td = `<td class="sMon-GroupBy-stats-tdWithLine">
						<div>${rounder(val)}</div>
						<svg style="width:${mw}; height:${h}px" viewBox="0 0 ${mw} ${h}" xmlns="http://www.w3.org/2000/svg">
							${tag('rect', '', {
								...(row ? row._$$$pathAttrs : {}),
								x:0, 
								y:0, 
								width  : w,
								height : h,
								fill   : color
							})}
						</svg>
					</td>
				`;
			}
			return tag('tr', `<th>${name}</th> ${td}`, row ? row._$$$rowAttrs : {});
		}
		return '<table class="table sMon-GroupBy-stats">'+Object.entries(rows).map(renderRow).join('')+'</table>';
	}
	toChartData(data){
		const nameCol = this.options.filter.nameCol; 
		return data.map(row=>({
			name : nameCol+'='+row[nameCol],
			color: row.color,
			count: row.count,
			pathAttrs : row._$$$pathAttrs,
		}));
	};
	renderPie(data, opts={}){
		return pie(this.toChartData(data), opts);
	}
	renderHisto(data, opts={}){
		return histo(this.toChartData(data), opts);
	}
	filterColsNames(cols, data){
		const haveNum = (data[0] && data[0].num!==undefined) ? 1 : 0;
		//console.log({haveNum});
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

module.exports = TableGroupBy;