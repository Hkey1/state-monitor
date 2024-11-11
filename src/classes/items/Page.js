const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Items        = require('./Items.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');
const E404         = require('../PageNotFound.js');


//TODO: Cards/Card
//TODO: Rows/Row/Col
//TODO: login and Password


class Page extends Items{
	static parentOptionsKey  = false
	static parentOptionsKeys = []	
	constructor(options){
		super(options);
		this.pages      = [];
		this.pageByName = {};
		assert.equal(typeof(this.options.pages ||= []), 'object');
		mustBe.oneOf(this.options.hideChildPagesInSidebar ??= false, [true, false, 'auto', 'notCurrent']);		
		
		if(Array.isArray(options.pages)){
			options.pages.forEach(page => this.addPage(page))
		} else if(options.pages){
			mustBe.normalObject(options.pages);
			Object.entries(options.pages).forEach(([name, page])=> 
				this.addPage(this.normalizePage(page, name))
			);
		}
	}
	onBeforeInit(){
		super.onBeforeInit();
		this.pages.forEach(page=>page.beforeInit());
	}	
	onInit(){
		super.onInit();
		assert(!this.parent || this.parent instanceof lib.base.Page)
		assert(this.parent  || this instanceof lib.base.Server)
		this.pages.forEach(page=>page.init());
	}
	isActiveOrParent(req){
		return req.sMon.path.startsWith(this.path);
	}
	isActive(req){
		return req.sMon.path === this.path;
	}
	isParent(req){
		return (req.sMon.path.length > this.path.length && req.sMon.path.startsWith(this.path))		
	}
	url(req, path=undefined){		
		path      ??= this.path;
		let prefix  = req.sMon.prefix;
		
		if(path[0] === '/' && prefix && prefix[prefix.length-1]==='/'){
			path = path.substring(1);
		}
		path = prefix+path;				
		return req.protocol + '://' + req.get('host') + ((path[0]==='/') ? path : '/'+path);
	}
	normalizePage(page, name=undefined){
		if(!(page instanceof Page)){
			page = new lib.classes.Page(page);
		}
		return this.setItemName(page, name);
	}
	addPage(...pages){
		assert(!this.wasInit);
		if(pages.length!==1){
			return pages.forEach(page=>this.addPage(page));
		}
		
		let page = pages[0];
		assert(!this.wasInit);
		page = this.normalizePage(page);
		assert(page.name);
		assert(!(page.name in this.pageByName));
		this.pages.push(page);
		this.pageByName[page.name] = page;
		page.parent = this;
		page.onPushed();
		return page;
	}
	$isAnyParentRow(){  return false};
	$isAnyParentRows(){ return false};
	$path(){
		const cur    = encodeURIComponent(this.name);
		assert(this.parent !== this);
		const prefix = this.parent.path;
		const path   = (prefix && prefix[prefix.length-1]==='/') ? prefix + cur :  prefix +'/'+cur
		return path[0]==='/' ? path.substring(1) : path;
	}
	onPushed(){
		this.pages.forEach(page=>page.onParentPushed());
		super.onPushed();
	}
	onParentPushed(){
		this.pages.forEach(page=>page.onParentPushed());
		super.onParentPushed();			
	}
	findPage(pathArr, pos){
		if(pos === pathArr.length){
			return this;
		}
		const cur = pathArr[pos];
		console.log(this.name, cur, pos, pathArr);
		
		if(cur in this.pageByName){
			return this.pageByName[cur].findPage(pathArr, pos+1);
		} else throw new E404('404. Page Not Found. Path='+pathArr.join('/'));
	}
	async renderBody(req){ 
		return await this.template('page-body', req, {
			headline : await this.renderHeadline(req),
			content  : await super.renderBody(req),
		});
	}
	async renderHeadline(req){
		return await this.template('page-headline', req, {
			name        : this.name,
			fullName    : await this.option('fullName', req, 'string', true, true),
			details     : await this.option('details',  req, 'string', true, true),			
			badge       : await this.getBadge(req),
			breadcrumbs : await this.renderBreadcrumbs(req),		
			icon        : await this.getIcon(req),
		});
	}
	async renderBreadcrumbs(req){
		return await this.template('page-breadcrumbs', req, {
			url         : this.url(req),
			isActive    : this.isActive(req),
			name        : this.name,
			fullName    : await this.option('fullName', req, 'string', true, true),
			details     : await this.option('details',  req, 'string', true, true),			
			badge       : await this.getBadge(req),
			before      : this.parent ? await this.parent.renderBreadcrumbs(req) : '',
		});
	}
	$neadBeRows(){return true};
	async renderInSidebar(req){ 
		return await this.template('page-sidebar', req, {
			isActive : this.isActive(req),
			isParent : this.isParent(req),
			name     : this.name,
			badge    : await this.getBadge(req),
			url      : this.url(req),
			childs   : await this.renderSubPagesInSidebar(req),
			fullName : await this.option('fullName', req, 'string', true, true),
			details  : await this.option('details',  req, 'string', true, true),			
			tooltip  : await this.option('tooltip',  req, 'string', true, true),
			icon     : await this.getIcon(req),
		});
	}	
	async renderSubPagesInSidebar(req){
		if(this.pages.length===0){
			return '';
		}
		let hide = this.options.hideChildPagesInSidebar;
		hide     = hide==='auto' ? this.isActiveOrParent(req) : hide;
		let pages = [];
		if(!hide){
			pages = this.pages.slice(0);
		} else if(hide==='notCurrent' && this.isParent(req)){
			pages = [this.pages.find(page=>page.isActiveOrParent(req))];
		}
		return pages.length ? await this.template('page-sidebar-childs', req, {
			pages, 
			content : await this.renderSubPagesContentInSidebar(req, pages),
		}) : '';
	}	
	async renderSubPagesContentInSidebar(req, pages=undefined){		
		return (await Promise.all((pages || this.pages).map(
			page=>page.renderInSidebar(req)
		))).join(' ')
	}
};
module.exports = Page;