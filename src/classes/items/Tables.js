const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const Tabs           = require('./Tabs.js');
const AbstractItem   = require('./AbstractItem.js');
const lib            = require('../../lib.js');
const AbstractFilter = require('../filters/AbstractFilter.js');
const GroupBy        = require('../filters/GroupBy.js');

class Tables extends Tabs {	
	static shortKey = 'tables'
	static _options = ['data'];
	
	castChildItem(opts, name=undefined){
		function isGroupBy(val){
			return (val && typeof(val)==='object' && !Array.isArray(val) && !(val instanceof AbstractItem)
		  	   && ((val instanceof GroupBy) || (val.groupBy))
			)
		}
		if(typeof(opts)==='object' && (isGroupBy(opts) || isGroupBy(opts.filter))){
			return new lib.classes.TableGroupBy(opts);
		} else if(typeof(opts)==='string' || opts instanceof AbstractItem || (typeof(opts)==='object' && lib.getSpecialKeys(opts).length!==0)){
			return super.castChildItem(opts, name);			
		} else {
			return new lib.classes.Table(opts);
		}
	}
	$haveBadge(){return ('badge' in this.options)||('data' in this.options)}
	async getBadge(req){
		try{
			if(this.options.badge || !this.options.data){
				return await super.getBadge(req);
			} else {
				return (await this.option('data', req, 'array')).length + '';
			}
		} catch(e){
			console.error(e);
			return 'err';
		}
	}				
};

module.exports = Tables;