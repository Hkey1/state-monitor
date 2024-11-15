const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const AbstractFilter = require('./AbstractFilter.js');
const getKey         = require('../../functions/getKey.js');

class GroupBy extends AbstractFilter{
	constructor(cols, opts={}){
		if(typeof(cols)==='object' && !Array.isArray(cols)){
			mustBe.normalObject(cols);
			assert(opts===undefined || Object.keys(opts).length===0);
			assert(opts.cols  || opts.col);
			assert(!opts.cols || !opts.col);
			
			opts = cols;
			cols = opts.cols || opts.col || opts.groupBy;
		}
		let {countCol, keyCol, map, ranges, names, hideEmpty} = opts; 
		Array.isArray(cols) ? cols.forEach(col=>mustBe.notEmptyString(col)) : mustBe.notEmptyString(cols);
		assert(cols.length);

		countCol === undefined || mustBe.notEmptyString(countCol);
		keyCol   === undefined || mustBe.notEmptyString(keyCol);
		map      === undefined || (map instanceof Map)  || typeof(map)==='function' || mustBe.normalObject(map);
		ranges   === undefined || Array.isArray(ranges) || mustBe.normalObject(ranges);

		cols     = Array.isArray(cols) ? cols : [cols];
		keyCol ??= cols.join('|')
		
		super();
		
		this.cols         = cols;
		this.countCol     = countCol;
		this.keyCol       = keyCol; 
		this.map          = map;
		this.names        = names;
		this.hideEmpty  ??= !ranges;
		
		if(ranges){
			this.ranges      = this.normalizeRanges(ranges);
			this.rangeByName = Object.fromEntries(this.ranges.map(range=>[range.name, range])); 
		}
	}
	normalizeRanges(ranges){
		ranges = !Array.isArray(ranges) ? Object.entries(ranges).map(([name,range])=>{
			range = typeof(range)==='number' ? {to: range} : range;
			return {name, ...range};
		}) : ranges;
		ranges = ranges.map(range=>{
			return {...(typeof(range)==='number' ? {to: range} : range)};
		});		
		ranges = ranges.sort((a,b)=>a.to-b.to);
		ranges.forEach((range,num)=>{
			range.num = num;
		});		
		ranges.forEach((range,num)=>{
			const prev = ranges[num-1];
			const next = ranges[num+1];
			if(!range.name){
				if(!prev || !isFinite(prev.to)){
					range.name = '…—'+range.to;
				} else if(!isFinite(range.to)){
					range.name = prev.to+'—…';
				} else {
					range.name = prev.to+'—'+range.to;
				}
			}
		});
		return ranges;
	}
	async filter(data, item, req){
		const {map, keyCol, cols, countCol, ranges, rangeByName, hideEmpty, names} = this;
		const countbyKey = {};
		if(ranges){
			ranges.forEach(range=>countbyKey[range.name]=0)
		}
		if(names){
			names.forEach(name=>countbyKey[name]=0)
		}
		if(!ranges && names===undefined && typeof(map)==='object' && !Array.isArray(map)){
			((map instanceof Map) ? map.values() : Object.values(map))
				.forEach(val=>countbyKey[name]=0);
		}
		let sum = 0;
		const mapType = typeof(map);
		data.forEach((row, i)=>{
			const cnt = countCol ? (1*row[countCol] || 0 ): 1;
			let   key = cols.map(col=>row[col]);
			if(mapType==='object'){
				key = getKey(map, key) ?? key;
			} else if(mapType==='function'){
				key = map(key, row, data, i);
				if(key===undefined){
					return;
				}
			}			
			if(ranges){
				const range = ranges.find(range=>range.to >= key); 
				if(!range){
					return;
				}
				key = range.name;
			}
			countbyKey[key] ??= 0;
			countbyKey[key]  += cnt;
			sum              += cnt; 
		});
		return Object.entries(countbyKey).map(([key, count])=>{
			return {
				num : rangeByName ? rangeByName[key].num : undefined,
				[keyCol]:  key,
				count,
				procent: Math.round(100*count/sum)+'%',
			}
		}).filter(row=>!hideEmpty || row.count!==0).sort((a,b)=>{
			if(rangeByName){
				return a.num - b.num; 
			} else {
				return a[keyCol].localeCompare(b[keyCol])
			}
		});
	}	
};
module.exports = GroupBy;