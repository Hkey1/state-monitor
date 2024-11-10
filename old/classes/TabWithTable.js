const assert   = require('node:assert');
const mustBe   = require('hkey-must-be');
const Table    = require('./Table.js');
const Tab      = require('./Tab.js');
const splitOpts = require('../functions/splitOptions.js');

class TabWithTable extends Tab {
	constructor(options){
		const [tableOpts, thisOpts] = splitOpts(options, ['items','data','cols', 'dataTables']);
		super(thisOpts);
		
		this.table = new Table(tableOpts);
		super.push(this.table);
	}
	push(view){
		this.table.push(view);
	}
};
module.exports = TabWithTable;