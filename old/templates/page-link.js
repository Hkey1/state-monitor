const tag = require('../Functions/tag.js');

module.exports = async (req, {url, isActive, isParent, content})=>tag('a', content, {
	href: url, 
	'class' : ('smon-page smon-page-link' 
		+(isActive ? ' current active ': '')
		+(isParent ? ' parent '        : '')
	)
});