const express  = require('express');
const sMon     = require('./index.js');

const {Server, HTML, Page, Tabs, Table, InfoTable} = sMon;

//TODO Rows, Row, Col
//TODO login Password
//TODO tableGroupBy как бейдж считать число непустых строк
//TODO tab fullName и details отображать в контенте

const app  = express(); 
const data = [
	{name: 'Mark',  active: true, a: 1, b:2},
	{name: 'Jack',  active: true, a: 3, c:4},
	{name: 'Jane',  active: false, a: 5, d:6},
	{name: 'Ivan',  active: false, a: 7, b:8},
	{name: 'Andry', active: false, a: 7, b:8},
	{name: 'Filip', active: false, a: 7, b:8},
	{name: 'Nick',  active: true, a: 3, c:4},
	{name: 'Nill',  active: true, a: 3, c:4},
	{name: 'Mike',  active: true, a: 3, c:4},
	{name: 'Oleg',  active: true, a: 5, c:7},
	{name: 'Olga',  active: true, a: 6, c:4},	
	{name: 'Rost',  active: true, a: 3, c:3},	
	{name: 'Vlad',  active: true, a: 3, c:3},	
	{name: 'Vadim',  active: false, a: 3, c:3},	
	{name: 'Vano',  active: true, a: 3, c:3},	
	{name: 'Lev',  active: true, a: 3, c:3},	
	{name: 'Leo',  active: true, a: 3, c:3},	
	{name: 'Sasha',  active: true, a: 3, c:3},	
	{name: 'Masha',  active: true, a: 3, c:3},	
	{name: 'Nickolo',  active: true, a: 3, c:3},		
];
data.forEach(row=>{
	row.latency = Math.round(100 * (Math.random() + Math.random() + Math.random()));
})

const info = {
	key1  : 'val1',
	key2  :  ['val2a', 'val2b'],
	$key3 : ['val3a', 'val3b', 'val3с'],
	key3  : ['val4a', 'val4b'],
};


const server = new Server({
	icon: 'https://icons.getbootstrap.com/assets/icons/apple.svg',
	//'amazon',
	//'apple',
	
	/*
	async ()=>`
		<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-amazon" viewBox="0 0 16 16">
			<path d="M10.813 11.968c.157.083.36.074.5-.05l.005.005a90 90 0 0 1 1.623-1.405c.173-.143.143-.372.006-.563l-.125-.17c-.345-.465-.673-.906-.673-1.791v-3.3l.001-.335c.008-1.265.014-2.421-.933-3.305C10.404.274 9.06 0 8.03 0 6.017 0 3.77.75 3.296 3.24c-.047.264.143.404.316.443l2.054.22c.19-.009.33-.196.366-.387.176-.857.896-1.271 1.703-1.271.435 0 .929.16 1.188.55.264.39.26.91.257 1.376v.432q-.3.033-.621.065c-1.113.114-2.397.246-3.36.67C3.873 5.91 2.94 7.08 2.94 8.798c0 2.2 1.387 3.298 3.168 3.298 1.506 0 2.328-.354 3.489-1.54l.167.246c.274.405.456.675 1.047 1.166ZM6.03 8.431C6.03 6.627 7.647 6.3 9.177 6.3v.57c.001.776.002 1.434-.396 2.133-.336.595-.87.961-1.465.961-.812 0-1.286-.619-1.286-1.533M.435 12.174c2.629 1.603 6.698 4.084 13.183.997.28-.116.475.078.199.431C13.538 13.96 11.312 16 7.57 16 3.832 16 .968 13.446.094 12.386c-.24-.275.036-.4.199-.299z"/>	
			<path d="M13.828 11.943c.567-.07 1.468-.027 1.645.204.135.176-.004.966-.233 1.533-.23.563-.572.961-.762 1.115s-.333.094-.23-.137c.105-.23.684-1.663.455-1.963-.213-.278-1.177-.177-1.625-.13l-.09.009q-.142.013-.233.024c-.193.021-.245.027-.274-.032-.074-.209.779-.556 1.347-.623"/>
		</svg>
	`,*/
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
			icon: '1-circle',
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
			icon: 'segmented-nav',
			tabs:{
				style: 'cards',
				_width: 3,
				items: {
					tab1: 'this is tab1',
					tab2: async ()=>'this is tab2',
					tab3: {
						html: 'this is tab3',
						tabs : {
							items: {
								tab3a: 'this is tab3a',
								tab3b: 'this is tab3b',
							}
						},
						badge: ()=>'someBadge',					
					},			
					tab4: {
						table: data,					
					},
				}
			},
		},
		tablesPage: {
			tables: {
				data,
				_width : 6,
				items: {
					all      : row=>true,
					histo    : {groupBy: 'latency', ranges: [50, 100, 125, 150, 175, 200, Infinity], useIconInPage: true},
					active   : row=>!!row.active,
					pasive   : row=>row.active ? false : {...row, active:undefined}, //hide col `active`
					tab1     : 'someTab1',
					byActive : {groupBy: 'active'}, 
				}
			}
		},
		paraPage: {	
			tabs:{
				style: 'paragraphs',
				items: {
					'p1': {
						tabs:{
							style: 'paragraphs',
							items: {
								p1a: {
									tabs: {
										style: 'paragraphs',
										items: {
											p1a1: 'this is p1a1',
											p1a2: 'this is p1a2',
										}
									}
								},
								p1b: 'this is p1b',
							}
						}
					},
					'p2': 'this is p2'
					
				}
			}
		},
		ulPage: {
			list:{
				i1: {
					html  : 'this is i2',
					badge : '123',  
				},
				i2: 'this is i2',
				i3: 'this is i2',
			}
		},
		infoPage: {	
			infoTable : {data:info},
		},
		panelsPage: {	
			panels: {
				_width: 3,
				_expand: true,
				items: {
					panel1: 'this is panel1',
					panel2: 'this is panel2',
					panel3: 'this is panel3',
					panel4: {html:'this is panel4', badge: 'dd1', tooltip:'some tooltip', details: 'some details', icon: 'amazon'},
					panel5: {table:data},
				}
			}
		}
	},
});
app.use(server.middleware);
app.listen(3000);