const assert       = require('node:assert');
const mustBe       = require('hkey-must-be');
const Items        = require('./Items.js');
const AbstractItem = require('./AbstractItem.js');
const lib          = require('../../lib.js');

const styles       = {
	tab      : ['tabs', 'pills', 'underline', 'links'],
	panel    : ['panels', 'accordion'], 	
	card     : ['cards'],
	paragraph: ['paragraphs'],
	li       : ['ul', 'ol'],	
	alert    : ['alerts'],
	listItem : [
		'list', 
		'listFlush', 'listNumbered', 
		'flushList', 'numberedList',
		'listFlushNumbered', 'listNumberedFlush', 
		'flushNumberedList', 'numberedFlushList', 
	],	
}
const allStyles = []
const childTemplateNameByStyle = {}; 
const primaryStyleByStyle      = {}; 
Object.entries(styles).forEach(([childTemplate, cStyles])=>{
	allStyles.push(...cStyles);
	cStyles.forEach(style=>{
		childTemplateNameByStyle[style] = childTemplate;
		primaryStyleByStyle[style]      = cStyles[0];
	});
});

class Tabs extends Items{
	static shortKey     = 'tabs'	
	static defaultStyle = 'tabs'
	static childClassName = 'Tab';
	static _options = ['style', 'type'];
	static childNameMustBeUnique  = true
	static childNameMustBeDefined = true
	static defineSubClasses(){
		if(this!==lib.classes.Tabs){
			return;
		}
		function ucFirst(str){
			return str.charAt(0).toUpperCase() + str.slice(1)
		}
		function defineClass(shortKey, parent, childClassName=undefined, defStyle=undefined){
			class Class extends parent{}
			const name = shortKey.length<=2 ? shortKey.toUpperCase() : ucFirst(shortKey);
			Object.defineProperty(Class, 'name', {value: name})
			Class.defineSubClasses = undefined;
			Class.shortKey         = shortKey;
			if(childClassName){
				Class.defaultStyle    = defStyle ?? shortKey;
				Class.childClassName  = childClassName;				
			} else {
				Class.defaultTemplate = shortKey;
			}
			Class.addToBase        = true;
			lib.addClass(Class);
			return Class; 
		}
		Object.entries(styles).forEach(([childTemplate, cStyles])=>{
			if(childTemplate!=='tab'){
				const childClass = defineClass(childTemplate, lib.classes.Tab);
				cStyles.forEach(style=>{
					defineClass(style, lib.classes.Tabs, childClass.name);
				});
			} else {
				cStyles.forEach(style=>{
					if(style!=='tabs'){
						defineClass('tabs'+ucFirst(style), lib.classes.Tabs, 'Tab', style);
						defineClass(style+'Tabs', lib.classes.Tabs, 'Tab', style);
					}
				});
			}
		});
	}
	normalizeOptions(options){
		Array.isArray(options) || mustBe.normalObject(options);
		assert(!(options instanceof AbstractItem));
		
		options = Array.isArray(options) ? {items: options} : options;
		options = this.normalizeItems(options);		

		this.checkSpecialKeys(options, ['items']);		
		mustBe.oneOf(options.style ??= this.constructor.defaultStyle, allStyles);
		options._templateName ??= childTemplateNameByStyle[options.style];
		if(options._active===undefined){
			if(options.style === 'panels'){
				options._active=true;
			} else if(styles.listItem.includes(options.style)){ 
				options._active=false;
			} else {
				options._active=0;
			}
		}
		return options;
	}
	castChildItem(opts, name=undefined){
		return lib.classes[this.constructor.childClassName].toInstance(opts, name);
	}
	async renderBody(req, content=undefined){
		const style    = this.options.style;
		const style0   = primaryStyleByStyle[style];
		if(style0==='tabs'){
			return super.renderBody(req, await this.template('tabs', req, {
				style,
				heads   : await this.renderChilds(req, 'renderTabHead', ''),
				content : content ?? await this.renderChilds(req, 'renderTabBody', ''),
			}));
		} else {
			mustBe.oneOf(style, allStyles);
			content ??= await this.renderContent(req);
			content   = await super.renderBody(req, content);
			let templateName = this.findTemplate(style)        ? style        : style0;
			templateName     = this.findTemplate(templateName) ? templateName : (this.neadBeRow ? 'row' : false);
			if(templateName){
				content = this.template(templateName, req, {
					content, style, 
					type      : this.options.type,
					id        : this.id,
					classes   : this.neadBeRow ? 'row' : '',
				});
			}
			return content;
		}
	}
	$isContentRow(){return styles.tab.includes(this.options.style) && this.neadBeRow}		
	$isPlainItems(){return !styles.tab.includes(this.options.style)}
};
module.exports = Tabs;