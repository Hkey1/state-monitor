const assert    = require('node:assert');
const mustBe    = require('hkey-must-be');
const Page      = require('./Page.js');
const pjson     = require('../../../package.json');

const defaultName = 'sMon';
class Server extends Page {	
	constructor(options){
 		super(options);
		this.name                 ??= defaultName;
		this.options.details      ??= 'no server.details'
		this.options.sidebarWidth ??= 280;		
		if(!options.badge){
			this.options.badge = ()=>this.name===defaultName ? pjson.version : ''
		}
		this.middleware             = this._middleware.bind(this);
 	}
	async renderSidebar(req){
		const width = this.options.sidebarWidth;
		return await this.template('sidebar', req, {
			isActive : this.isActive(req),
			childs   : await this.renderSubPagesInSidebar(req),
			width    : isNaN(1*width) ? width : width+'px',
			details  : await this.option('details',  req, 'string', true, true),
			fullName : await this.option('fullName', req, 'string', true, true),
			badge    : await this.getBadge(req),
			name     : this.name,
			url      : this.url(req),
		});
	}
	$path() {return '/'}
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
		this.init();
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
		return await this.template('main', req, {
			content   : await page.renderBody(req), 
			title     : 'sMon',
			inlineJS  : await this.template('js', req),
			inlineCSS : await this.template('css', req),
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