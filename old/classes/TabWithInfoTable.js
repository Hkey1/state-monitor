const assert    = require('node:assert');
const mustBe    = require('hkey-must-be');
const InfoTable = require('./Table.js');
const Tab       = require('./Tab.js');
const splitOpts = require('../functions/splitOptions.js');

class TabWithInfoTable extends Tab {
	constructor(options){
		const [tableOpts, thisOpts] = splitOpts(options, ['data']);
		super(thisOpts);
		
		this.table = new InfoTable(tableOpts);
		this.push(this.table);
	}
};
module.exports = TabWithInfoTable;