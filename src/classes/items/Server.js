const fs        = require('node:fs');
const {dirname} = require('node:path');
const assert    = require('node:assert');
const md5       = require('md5');
const mustBe    = require('hkey-must-be');
const Page      = require('./Page.js');
const Files     = require('../Files.js');
const isUrl     = require('../../functions/isUrl.js');
const pjson     = require('../../../package.json');

const assetsDir   = dirname(dirname(__dirname))+'/assets/'
const defaultName = 'sMon';

class Server extends Page {	
	static _options = ['sidebarWidth', 'favicon'];

	constructor(options){
 		super(options);
		this.name                 ??= defaultName;
		this.options.details      ??= 'no server.details'
		this.options.sidebarWidth ??= 280;		
		if(!options.badge){
			this.options.badge = ()=>this.name===defaultName ? pjson.version : ''
		}
		this.middleware             = this._middleware.bind(this);
		this._files                 = new Files(this);
		
		const anonymous             = {crossorigin:'anonymous'};
		
		this.addFiles({
			'jquery.js'         : {url: 'https://code.jquery.com/jquery-3.7.1.js', attrs:{...anonymous, integrity:"sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4="}},

			'bootstap.css'      : {url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', attrs:{...anonymous, integrity:"sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"}},
			'bootstap-icons.css': {url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css', attrs:{...anonymous, integrity:"sha384-tViUnnbYAV00FLIhhi3v/dWt3Jxw4gZQcNoSCxCIFNJVCx7/D55/wXsrNIRANwdD"}},
			'bootstap.js'       : {url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', attrs:{...anonymous, integrity:"sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"}},

			'datatables.css'    : {url: 'https://cdn.datatables.net/2.1.8/css/dataTables.dataTables.css', attrs:{...anonymous}},
			'datatables.js'     : {url: 'https://cdn.datatables.net/2.1.8/js/dataTables.js',              attrs:{...anonymous}},
			
			'inline.css'        : {content: ()=>this.inline_css, inline: true},
			'inline.js'         : {content: ()=>this.inline_js,  inline: true},  
		});
 	}
	$inline_css(){ return fs.readFileSync(assetsDir+'inline.css', "utf8")}
	$inline_js() { return fs.readFileSync(assetsDir+'inline.js',  "utf8")}
	
	get files()   { return this._files.files; }
	set files(val){ mustBe.normalObject(val); return this._files.files = val}
	
	addFile(file){
		return this._files.addFile(file);
	}
	addFiles(files){
		return this._files.addFiles(files);
	}
	onInit(){
		super.onInit();
		let icon = (this.options.favicon || this.options.icon);
		if(icon){
			const type = typeof(icon);
			icon = (type==='string' && !isUrl(icon) && !icon.includes('<')) ? `https://icons.getbootstrap.com/assets/icons/${icon}.svg` : icon;
			const contentType = (type==='function' ||(!isUrl(icon) && type==='string' && icon.includes('<'))) ? "image/svg+xml" : undefined;
			console.log({contentType, type});
			this.addFile({
				name    : 'favicon',
				include : 'favicon',
				[isUrl(icon) ? 'url' : 'content']: icon,
				contentType,
				attrs   : {type: contentType}
			});
		}
		this._files.init();
	}

	onBeforeInit(){
		super.onBeforeInit();
		this._files.beforeInit();
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
			icon     : await this.getIcon(req),
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
		const prefix = ['___files/', '/___files/'].find(prefix=>req.sMon.path.startsWith(prefix));
		if(prefix){
			return await this._files.respond(req, res, req.sMon.path.substring(prefix.length))
		}
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
		//console.log('renderPage');
		const page    = this.findPage(req.sMon.path);
		return await this.template('main', req, {
			content   : await page.renderBody(req), 
			title     : 'sMon',
			styles    : await this._files.renderStyles(req),
			scripts   : await this._files.renderScripts(req),
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