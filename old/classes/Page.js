const assert = require('node:assert');
const mustBe = require('hkey-must-be');
const AbstractItem = require('./AbstractItem');
const Tabs   = require('./Tabs.js');
const Tab    = require('./Tab.js');
const E404   = require('./PageNotFound.js');

function normalizeHide(hide){
	hide ??= false;
	mustBe.oneOf(hide, [true, false, 'auto', 'notCurrent']);
	return hide;
}

class Page extends Tabs{
	constructor(options){
		assert(options.parent===undefined || options.parent instanceof Page);
		options.hideSubPagesInSidebar = normalizeHide(options.hideSubPagesInSidebar);
		options.pages ||= [];
		assert.equal(typeof options.pages, 'object');
	
		let hide = true;
		if(typeof(options.items)==='object'){
			if(Array.isArray(options.items)){
				hide = !options.items.find(item => item instanceof Tab);
			} else if(options.items instanceof AbstractItem){
				hide = !(options.items instanceof Tab)
			} else if(!(options.items instanceof Promise)){
				hide = false;
			}
		}
		options.hideHeader    ??= hide;
		options.checkItemName ??= options.hideHeader!==true;
		options.details       ??= ''; 
				
		super(options);
		
		this.parent     = options.parent;
		this.name       = options.name;
	
		if(!Array.isArray(this.options.pages)){
			assert(!(this.options.pages instanceof Promise))
			this.options.pages = Object.entries(this.options.pages).map(([name, opts])=>
				this.normalizeChildPage(opts, name)
			)
		}
		
		this.pages      = []; 
		this.pageByName = {};
		this.options.pages.forEach(page=>this.addPage(page));
		
		this._path = undefined;
	}	
	async renderBreadcrumbs(req){
		return await this.template(req, 'page-breadcrumbs', {
			url       : this.url(req),
			isActive  : this.isActive(req),
			content   : await this.renderName(req, 'breadcrumbs'),
			before    : this.parent ? await this.parent.renderBreadcrumbs(req) : '',
		});
	}
	static normalizeChildPage(opts, name=undefined){
		function setName(){
			if(name===undefined){
				assert(opts.name);
			} else if(opts.name===undefined){
				assert(name);
				opts.name = name;
			} else assert.equal(opts.name, name);
			return opts;
		}
		const type = typeof(opts);
		if(type==='function'){
			assert(name||opts.name);
			return new Page({items: [opts], name:name||opts.name});
		} else if(type==='string'){
			assert(name);
			return new Page({items: [opts], name})
		} else if(type==='object'){
			if(Array.isArray(opts)){
				assert(name);
				return new Page({items: opts, name});				
			} else if(opts instanceof Page){
				return setName();
			} else if(opts instanceof AbstractItem){
				assert(name || opts.name);
				assert(opts.constructor !== AbstractItem);
				return new Page({items: [opts], name:name||opts.name});
			} else {
				assert(!(opts instanceof Promise));
				return new Page(setName(opts));
			}
		} else throw new Error('typeof(page)='+type)
	}
	normalizeChildPage(opts, name=undefined){
		return this.constructor.normalizeChildPage(opts, name);
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
	addPage(page){
		page = this.normalizeChildPage(page);
		if(page.name in this.pageByName){
			throw new Error('already have child page with name=`'+page.name+'`');
		}
		assert(page instanceof Page);
		assert(page.parent === this || page.parent === undefined);
		this.pages.push(page);
		this.pageByName[page.name] = page;
		page.parent = this;
		page.onPushed();
	}
	get path(){
		if(!this._path){
			const cur    = encodeURIComponent(this.name);
			const prefix = this.parent.path;
			this._path   = (prefix && prefix[prefix.length-1]==='/') ? prefix + cur :  prefix +'/'+cur
			this._path   = this._path[0]==='/' ? this._path.substring(1) : this._path;
		}
		return this._path;
	}
	url(req){		
		let path   = this.path;
		let prefix = req.sMon.prefix;
		
		if(path[0] === '/' && prefix && prefix[prefix.length-1]==='/'){
			path = path.substring(1);
		}
		path = prefix+path;				
		return req.protocol + '://' + req.get('host') + ((path[0]==='/') ? path : '/'+path);
	}
	async renderLink(req, place=undefined){
		return await this.template(req, 'page-link', {place,
			url       : this.url(req),
			isActive  : this.isActive(req),
			isParent  : this.isParent(req),
			content   : await this.renderName(req, place),
		});
	}	
	async renderContent(req){
		return (await Promise.all([
			this.renderHeadline(req),
			super.renderContent(req),
		])).join(' ')
	}
	async renderHeadline(req){
		return await this.template(req, 'page-headline', {
			name        : await this.renderName(req, 'headline'),
			details     : await this.calcOption('details', req, 'string', true),	
			breadcrumbs : await this.renderBreadcrumbs(req),			
		});
	}
	async renderName(req, place=undefined){
		if(this.options.fullName && place==='headline'){
			return await this.calcOption('fullName', req, 'string', true)
		}
		return this.name;
	}
	isActiveOrParent(req){
		return req.sMon.path.startsWith(this.path);
	}
	isActive(req){
		return req.sMon.path === this.path;
	}
	isParent(req){
		const res = (req.sMon.path.length > this.path.length && req.sMon.path.startsWith(this.path))		
		//console.log('isParent', req.sMon.path, this.path);
		return res;
	}
	async renderInSidebar(req){
		return await this.template(req, 'page-sidebar', {
			isActive : this.isActive(req),
			isParent : this.isParent(req),
			name     : await this.renderName(req, 'sidebar'),
			url      : this.url(req),
			childs   : await this.renderSubPagesInSidebar(req),
		});
	}	
	async renderSubPagesContentInSidebar(req, pages=undefined){		
		return (await Promise.all((pages || this.pages).map(
			page=>page.renderInSidebar(req)
		))).join(' ')
	}
	async renderSubPagesInSidebar(req, hide=undefined){
		if(this.pages.length===0){
			return '';
		}
		mustBe.oneOf(hide, [undefined, true, false, 'auto']);
		hide = normalizeHide(hide);
		hide = hide==='auto' ? this.isActiveOrParent(req) : hide;
		let pages;
		if(!hide){
			pages = this.pages.slice(0);
		} else if(hide==='notCurrent' && this.isParent(req)){
			pages = [this.pages.find(page=>page.isActiveOrParent(req))];
		}
		if(pages && pages.length){
			return await this.template(req, 'page-sidebar-childs', {
				pages, 
				content : await this.renderSubPagesContentInSidebar(req, pages),
			});
		} else {
			return '';
		}
	}
};

module.exports = Page;