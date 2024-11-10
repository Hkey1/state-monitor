# state-monitor
Render application state. Node.js express middleware;

##Hello World
```js
const express  = require('express');
const sMon     = require(...);

const server = new Server({html: '<p>Hello World</p>'});

const app    = express(); 
app.use(server.middleware);
app.listen(3000);
```

###function
```js
const server = new Server({html: async(req)=>'<p>Hello World</p>'});
```

###many items
You can add $someString to key html
```js
const server = new Server({
	html     : '<p>Hello World 1</p>',
	html$2   : '<p>Hello World 2</p>',
	html$abc : '<p>Hello World 3</p>',
});
```

Or key use items key
```js
const server = new Server({
	items: [
		'<p>Hello World 1</p>',
		'<p>Hello World 2</p>',
		'<p>Hello World 3</p>',		
	]
}):
```


##Subpath
If you want run state-monitor not in http://localhost:3000/ but in http://localhost:3000/somePathPrefix 

```js
app.use(server.middleware('somePathPrefix'));
```

##Pages
```js
const server = new Server({
	pages: [
		page1: 'this is page1',
		page2: {html: 'this is page2'},
		page3: ['this is page3'],
		page4: {
			items: ['this is page4']
			pages: {
				page4a: 'this is page4a',
				page4b: 'this is page4b',
			},
		}
	]
}):
```
##Tabs
```js
const server = new Server({
	tabs : {
		tab1: 'this is tab1',
		tab2: 'this is tab2',		
	},
}):
```
OR

```js
const server = new Server({
	items:[
		{tabs : {
			tab1: 'this is tab1',
			tab2: 'this is tab2',		
		}}
	},
}):
```
OR

```js
const server = new Server({
	tabs : {
		items: {
			tab1: 'this is tab1',
			tab2: 'this is tab2',		
		}
	},
}):
```

##Table
```js
const server = new Server({
	table : async ()=>[
		{col1:'1.1',col2:'1.2'},
		{col1:'2.1',col2:'2.2'}
	],
}):
```

###Table with filters
Code below will be show 3 tabs:
	* all     : with all table rows 
	* active  : filtered rows: row.active
	* pasive  : filtered rows: !row.active without active col
	* someTab : tab with text this is somTab
```js
const server = new Server({
	table : {
		data: ..., 
		items: {
			active: row=>!!row.active, //select active rows
			pasive: row=>row.active ? false : {...row, active: undefined}, //hide column active		
			someTab: 'this is someTab'
		}		
	],
}):
```

* To change first tab name use option `name`;
* To change first tab rows use option `filter`
* To dont show count of rows in badge set option `badge` = '' 
