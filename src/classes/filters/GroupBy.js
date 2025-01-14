const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const AbstractFilter = require('./AbstractFilter.js');
const getKey         = require('../../functions/getKey.js');

class GroupBy extends AbstractFilter{
	constructor(opts){
		if(typeof(opts)==='string'){
			opts = {groupBy:opts};
		}
		mustBe.normalObject(opts);
		let {groupBy, nameCol, ranges} = opts;
		mustBe.notEmptyString(groupBy);
		mustBe.notEmptyString(nameCol ??= groupBy);
		ranges===undefined || Array.isArray(ranges) || mustBe.normalObject(ranges);

		super();
		if(ranges){
			ranges = this.constructor.normalizeRanges(opts.ranges);
			assert(Array.isArray(ranges));
			assert(ranges.length>0);
			ranges.forEach(range=>{
				mustBe.normalObject(range);
				mustBe.notEmptyString(range.name);
				assert.equal(typeof(range.to),'number');
			})
		}
		this.groupBy     = groupBy;
		this.nameCol     = nameCol;
		this.ranges      = ranges;
		this.rangeByName = ranges ? Object.fromEntries(ranges.map(range=>[range.name, range])) : undefined;
	}
	static normalizeRange(range, name=undefined){
		if(typeof(range)==='number'){
			range = {to: range};
		}
		mustBe.normalObject(range);
		assert.equal(typeof range.to, 'number');
		range.name ??= name;
		return range;
	}
	static normalizeRanges(ranges){
		if(ranges===undefined){
			return ranges;
		}
		if(Array.isArray(ranges)){
			ranges = ranges.map(range=>this.normalizeRange(range));
		} else {
			mustBe.normalObject(ranges);			
			ranges = Object.entries(ranges).map(([name, range])=>this.normalizeRange(range, name))
		}
		ranges = ranges.sort((a,b)=>a.to - b.to);
		let prevTo = -Infinity;
		function toStr(x){
			return isFinite(x) ? x : '…'
		}
		ranges.forEach((range, i)=>{
			range.from ??= prevTo;
			range.name ||= toStr(range.from)+'—'+toStr(range.to);
			range.num    = i;
			prevTo     = range.to;
		});
		return ranges;
	}
	async filter(data){
		assert(Array.isArray(data));
		const {groupBy, nameCol, ranges, rangeByName} = this;
		//console.log(ranges, rangeByName)
		
		const countbyKey = {};
		if(ranges){
			ranges.forEach(range=>{
				countbyKey[range.name] = 0;
			})
		}
		data.forEach(row=>{
			mustBe.normalObject(row);
			let val = row[groupBy];
			if(ranges){
				val   = val*1;
				const range = isNaN(val) ? false : ranges.find(range=>range.to>=val);
				if(range){
					val = range.name;
				} else {
					return;
				}
			}
			countbyKey[val] ||= 0;
			countbyKey[val]++;
		})
		const sum = Object.values(countbyKey).reduce((acc,val)=>acc+val, 0);
		let res = Object.entries(countbyKey).map(([name, count])=>{
			const range = ranges ?  rangeByName[name] : undefined;
			//console.log(name, range);
			return {
				num : range ? range.num : undefined,
				to  : range ? range.to : undefined,
				[nameCol]:  name,
				count,
				procent: Math.round(100*count/sum)+'%',
			}
		})
		if(!ranges){
			res.sort((a,b)=>a[nameCol].localeCompare(b[nameCol]))
		}
		return res;
	}	
};
module.exports = GroupBy;