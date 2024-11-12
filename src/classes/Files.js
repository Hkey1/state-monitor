const assert         = require('node:assert');
const mustBe         = require('hkey-must-be');
const md5            = require('md5');
const tag            = require('../functions/tag.js');
const isUrl          = require('../functions/isUrl.js');
const AbstractObject = require('./AbstractObject.js');
const PageNotFound   = require('./PageNotFound.js');

class Files extends AbstractObject{
	constructor(server){
		super();
		this.files  = {};
		this.server = server;
	}
	fileOptsToObject(file){
		const type = typeof(file);
		if(type === 'string'){
			file = {[isUrl(file) ? 'url' : 'content']: file};
		} else if(type === 'function'){
			file = {content: file};
		} else mustBe.normalObject(file);
		return file;
	}
	addFiles(files){
		const isArr = Array.isArray(files);
		isArr || mustBe.normalObject(files);
		files = isArr ? files : Object.entries(files).map(([name, file])=>{
			file = this.fileOptsToObject(file);
			file.name ??= name;
			return file; 
		})
		return files.map(file=>this.addFile(file));
	}
	addFile(file){
		file = this.fileOptsToObject(file);
		mustBe.normalObject(file);	
		if(!file.name && !file.url) throw new Error('You must specifify file.name or file.url')

		const f = file.name||file.url;
		Object.entries({
			include : [undefined, true, false, "js", "css", "favicon"],
			inline  : [undefined, true, false, "tag"],
			md5     : [true, false, undefined],
		}).forEach(([key, vals])=>{
			if(!vals.includes(file[key])){
				Error(f+`: file.${key}=${file[key]} must be one of`+vals.map(val=>typeof(val)==='string' ? `"${val}"`: val))
			}
		});
		
		if(file.name!==undefined){
			if(typeof(file.name)!=='string') throw new Error(f+`: typeof(file.name)=${typeof(file.name)}. Expected: string`);
			if(file.name.length==0) throw new Error(f+`: file.name.length=${type}`);
		}
		if(file.url!==undefined){
			if(typeof(file.url)!=='string') throw new Error(f+`: typeof(file.url)=${typeof(file.url)}. Expected: string`);
			if(file.url.length==0) throw new Error(f+`: file.url.length=${type}`);
		}
		
		if(file.content!==undefined){
			const type = typeof(file.content);
			if(type!=='string' && type!=='function' && type!=='object'){
				throw new Error(f+`: typeof(file.content)=${type} Expected: string, function or object`);
			}			
			if(Array.isArray(file.content))     throw new Error(f+'file.content is Array');
			if(file.content instanceof Promise) throw new Error(f+'file.content is Promise');
			type!=='object' || mustBe.normalObject(file.content);
			
			if(type==='object'){
				function checkRecursive(obj, path='',level=0){
					assert(level<10);
					const t = typeof(obj);
					if(t==='object'){
						if(Array.isArray(obj))     throw new Error(f+`: file.content${path} is Array`);
						if(obj instanceof Promise) throw new Error(f+`: file.content${path} is Promise`);
						mustBe.normalObject(obj);
						for(let key in obj){
							checkRecursive(obj[key], path+'.'+key, level+1);
						}	
					} else if(t!=='string'){
						throw new Error(f+`: typeof(file.content${path})=${t} Expected: string, function or object`);
					}
				}
			}			
		}
		if(file.attrs!==undefined){
			mustBe.normalObject(file.attrs);
		}

		if(file.url && file.md5)	                  throw new Error(f+`: If you specifify file.url, you must NOT set file.md5`);
		if(file.url && file.inline)	                  throw new Error(f+`: If you specifify file.url, you must NOT set file.inline`);
		if(file.inline && file.md5)                   throw new Error(f+`: If you specifify file.inline, you must NOT set file.md5`);
		if(file.inline && file.include === 'favicon') throw new Error(f+`: You cant include favicon inline`);
		if(file.content!==undefined){
			if(!file.name) throw new Error(f+`: If you specifify file.content, then you must set file.name`);
			if(file.url)   throw new Error(f+`: If you specifify file.content, then you must NOT set file.url`);
		}
		
		const fns  = ['favicon', 'favicon.csv', 'favicon.png', 'favicon.ico', 'favicon.jpg', 'favicon.jpeg'];
		if(file.include === true || file.include === undefined){
			['name', 'url'].forEach(key=>{
				let val = file[key];
				if(!val) return;
				for(let i=0; i<=1; i++){
					if(!file.include){
						val = i===1 ? val.split('?')[0] : val;
						const ext = val.split('.').slice(-1)[0];
						if(ext==='css' || ext==='js'){
							file.include = ext;
						} else if(fns.find(fn=>val.endsWith(fn))){
							file.include = 'favicon';
						}
					}
				}
			});
			if(!file.include) throw new Error(f+`: cant autodetect include. Please specifify file.include=false, "js", "css", or "favicon"`)				
		}

		file.name   ??= file.url;
		file.md5    ??= !file.url;
		file.inline ??= false;
		file.attrs  ??= {}
		
		this.files[file.name] = file;
		
		return file;
	}	
	async renderFileContent(req, file){
		if(file._content){
			return file._content;
		}
		const type = typeof(file.content);
		if(type==='string'){
			return file.content;
		} else if(type==='function'){
			return await file.content.call(this.server, req, this.server, file);
		} else if(type==='object'){
			let res = [];
			function pushRecursive(obj, path='', level=0){
				assert(level<10);
				if(path){
					res.push(`\n/* ${path} */`)
				}
				if(typeof(obj)==='string'){
					res.push(obj);					
				} else if(typeof(obj)==='object'){
					for(let key in obj){
						pushRecursive(obj[key], path+'.'+key, level+1)
					}
				} else throw new Error('something gone wrong');					
			}
			pushRecursive(file.content);
			res = res.join('\n');
			file._content = res;
			return res;
		} else throw new Error('something gone wrong');		
	}
	$arr(){
		return Object.values(this.files);
	}
	splitInline(all){
		const inline  = [], outline = [], tags = [];
		all.forEach(file=>(file.inline ? (file.inline==='tag' ? tags : inline) : outline).push(file));

		return {all, inline, outline, tags};
	}
	$styles(){
		return this.splitInline(this.arr.filter(file=>file.include && file.include!=='js'));
	}
	$scripts(){
		return this.splitInline(this.arr.filter(file=>file.include==='js'));
	}
	async getFileUrl(req, file, content=undefined){
		let res = file.url ?? this.server.url(req, '___files/'+file.name);
		if(file.md5){
			let cs = file._md5 || md5(await this.renderFileContent(req, file));
			res += '?md5='+cs;
			if(typeof(file.content)!=='function'){
				file._md5 = cs;
			}
		}
		return res;
	}
	async respond(req, res, fileName){
		try{
			if(fileName in this.files){
				const file = this.files[fileName];
				if(file.contentType){
					res.set('Content-Type', file.contentType);					
				} else if(file.include==='css'){
					res.set('Content-Type', 'text/css');
				} else if(file.include==='js'){
					res.set('Content-Type', 'text/javascript');
				}
				if(file.md5){
					res.set('Max-Age', '14400');
				}
				res.send(await this.renderFileContent(req, file));			
			} else {
				throw new PageNotFound(`file ${fileName} not found`)
			}
		} catch(e){
			res.status(e.httpStatus || 500).send(''+e);
			console.error(e);
		}
	}
	async _render(req, what){
		const isStyles = what==='styles';
		assert(isStyles || what==='scripts');
		const inlineTag  = isStyles ? 'style' : 'script';
		const outlineTag = isStyles ? 'link'  : 'script';
		const urlAttr    = isStyles ? 'href'  : 'src';
		
		const files = this[what];		
		//console.table(this.arr.map(({name, include, url})=>({name, include, url})));
		
		//for(let key in files){
		//	console.log(what, key);
		//	console.table(files[key].map(({name, include, url})=>({name, include, url})));
		//}
		const res = await Promise.all(files.outline.map(async file=>{
			return tag(outlineTag,'', {
				[urlAttr]: await this.getFileUrl(req, file),
				rel : isStyles ? ((file.include === 'css') ? 'stylesheet' : 'icon') : undefined,
				...file.attrs,
			})
		}));	
		
		if(files.inline.length){
			const inline = (await Promise.all(files.inline.map(async file=>(''
				+`\n\n/* file = ${file.name} */\n`
				+(await this.renderFileContent(req, file))
			)))).join('\n');
			res.push(`<${inlineTag}>${inline}</${inlineTag}>`);
		}
		res.push(...(await Promise.all(
			files.tags.map(file=>{
				if(typeof(file.content) === 'object'){
					return tag(file.content);
				} else return this.renderFileContent(req, file);
			})
		)));
		return res.join(`\n`);
	}
	async renderStyles(req){
		return await this._render(req, 'styles');
	}
	async renderScripts(req){
		return await this._render(req, 'scripts');
	}
};

module.exports = Files;