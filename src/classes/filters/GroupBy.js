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
			cols = opts.cols || opts.col;
		}
		let {countCol, keyCol, map} = opts; //sortBy
		Array.isArray(cols) ? cols.forEach(col=>mustBe.notEmptyString(col)) : mustBe.notEmptyString(cols);
		assert(cols.length);

		countCol === undefined || mustBe.notEmptyString(countCol);
		keyCol   === undefined || mustBe.notEmptyString(keyCol);
		map      === undefined || (map instanceof Map) || mustBe.normalObject(map);

		cols     = Array.isArray(cols) ? cols : [cols];
		keyCol ??= cols.join('|')
		
		super();
		
		this.cols     = cols;
		this.countCol = countCol;
		this.keyCol   = keyCol; 
		this.map      = map;
	}
	async filter(data, item, req){
		const {map, keyCol, cols, countCol} = this;
		const countbyKey = {};
		let sum = 0;
		data.forEach(row=>{
			const cnt = countCol ? (1*row[countCol] || 0 ): 1;
			let   key = cols.map(col=>row[col]);
			key       = map ? (getKey(map, key) ?? key) : key;			
			countbyKey[key] ??= 0;
			countbyKey[key]  += cnt;
			sum              += cnt; 
		});
		return Object.entries(countbyKey).map(([key, count])=>{
			return {
				[keyCol]:  key,
				count,
				procent: Math.round(100*count/sum)+'%',
			}
		}).sort((a,b)=>a[keyCol].localeCompare(b[keyCol]));
	}	
};

module.exports = GroupBy;