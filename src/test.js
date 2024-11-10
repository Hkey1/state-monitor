const express  = require('express');
const sMon     = require('./index.js');

const {Server, HTML, Page, Tabs, Table, InfoTable} = sMon;
// Card, Cards

const app    = express(); 

const data = [
	{name: 'Mark',  active: true, a: 1, b:2},
	{name: 'Jack',  active: true, a: 3, c:4},
	{name: 'Jane',  active: false, a: 5, d:6},
	{name: 'Ivan',  active: false, a: 7, b:8},
];
const info = {
	key1  : 'val1',
	key2  :  ['val2a', 'val2b'],
	$key3 : ['val3a', 'val3b', 'val3с'],
	key3  : ['val4a', 'val4b'],
};

const server = new Server({
	items: [
		'<p>1: Hello World!</p>',
		()=>'<p>2: Hello World!</p>',
		async ()=>'<p>3: Hello World!</p>',	
		new sMon.HTML('<p>4: Hello World!</p>'),	
		new sMon.HTML(()=>'<p>5: Hello World!</p>'),	
		new sMon.HTML(async ()=>'<p>6: Hello World!</p>'),			
	],
	html: '<p>7: Hello World!</p>',
	html$blabla: '<p>8: Hello World!</p>',
	html$9: ()=>'<p>9: Hello World!</p>',
	html$10: async ()=>'<p>10: Hello World!</p>',
	pages: {
		page1: {
			fullName : 'page1.fullName', 
			details  : 'page1.details',
			badge    : 'some badge',
			items:['<p>1: this is page1.items[0]</p>'],
			html: '<p>2: this is page1.html</p>',
			pages: {
				page1a: 'this is page1a',
				page2a: 'this is page2a',
			}
		},
		tabsPage: {
			tabs:{
				tab1: 'this is tab1',
				tab2: async ()=>'this is tab2',
				tab3: {
					html: 'this is tab3',
					tabs : {
						tab3a: 'this is tab3a',
						tab3b: 'this is tab3b',
					},
					badge: ()=>'someBadge',					
				},			
				tab4: {
					table: data,					
				},
			},
		},
		tablePage: {
			table: {
				data,
				childsWidth: 3,
				tabs: {
					active  : row=>!!row.active,
					pasive  : row=>row.active ? false : {...row, active:undefined}, //hide col `active`
					someTab1 : 'someTab1',
					someTab2 : 'someTab2',
					someTab3 : 'someTab3',
					someTab4 : 'someTab4',
					someTab5 : 'someTab5',
					someTab6 : 'someTab6',
				}
			}
		},
		rowsPage: {
			items: [
				{childsWidth: 3, items: ['col1','col2','col3','col4','col5','col6','col7','col8','col9','col10']}
			]			
		},
		infoPage: {	
			infoTable : info,
		},
		panelsPage: {	
			panels: {
				childsWidth: 3,
				childsExpand: true,
				items: {
					panel1: 'this is panel1',
					panel2: 'this is panel2',
					panel3: 'this is panel3',
					panel4: {html:'this is panel4', badge: 'dd1', tooltip:'some tooltip', details: 'some details'},
					panel5: {table:data},
				}
			}
		}
	},
});
app.use(server.middleware);
app.listen(3000);