const assert    = require('node:assert');
const mustBe    = require('hkey-must-be');
const Page      = require('./Page.js');
const templates = require('../templates/index.js');

class Server extends Page {	
	constructor(options){
		options.templates   = {...templates, ...(options.templates||{})};
		options.name         ||= 'sMon';
		options.details      ||= 'no server.details'
		options.sidebarWidth ||= 280;
 		super(options);
		this.middleware = this._middleware.bind(this);
 	}
	async renderSidebar(req){
		const width = this.options.sidebarWidth;
		return await this.template(req, 'sidebar', {
			isActive : this.isActive(req),
			childs   : await this.renderSubPagesInSidebar(req),
			details  : await this.calcOption('details', req, 'string', true),
			width    : isNaN(1*width) ? width : width+'px',
			details  : this.options.details,
			name     : this.options.name,
			url      : this.url(req),
		});
	}
	get path(){return '/'}
	_middleware(prefix='/', res=undefined, next=undefined){
		if(typeof(prefix)==='object' && res && next){
			return this._middlewareCb('/', prefix, res, next);
		} else {
			assert.equal(typeof(prefix), 'string');
			if(prefix[0]!=='/'){
				prefix = '/'+prefix;
			}
			if(prefix[prefix.length-1]!=='/'){
				prefix = prefix+'/';
			}			
			return this._middlewareCb.bind(this, prefix);
		}		
	} 
	async renderBreadcrumbs(req){
		return this.isActive(req) ? '' : await super.renderBreadcrumbs(req);
	}
	isActive(req){
		return req.sMon.path === this.path || req.sMon.path==='' || req.sMon.path==='/';
	}
	async respond(req, res, next){
		try{
			res.send(await this.renderPage(req));
		} catch(e){
			console.error(e);
			res.status(e.httpStatus || 500).send(''+e);
		}
	}
	findPage(path, pos=0){
		return path==='' ? this : super.findPage(Array.isArray(path) ? path : path.split('/').map(name=>decodeURIComponent(name)), pos);
	}	
	async renderPage(req){
		const page    = this.findPage(req.sMon.path);
		const content = await page.renderContent(req);
		const title   = 'sMon';
		
		return await this.template(req, 'main', {
			content, 
			title,
			inlineJS  : await this.template(req, 'js'),
			inlineCSS : await this.template(req, 'css'),
			sidebar   : await this.renderSidebar(req),
		});
	}
	_middlewareCb(prefix, req, res, next){
		if(req.path.startsWith(prefix)){
			req.sMon = {
				tableCache : {},
				path       : req.path.slice(prefix.length), 
				prefix     : prefix,
				server     : this,  
			};	
			this.respond(req, res, next);
		} else next();
	}
}
module.exports = Server;