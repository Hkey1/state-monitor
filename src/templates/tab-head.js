const tag = require('../Functions/tag.js');
module.exports = async (req, {name, fullName, details, isActive, buttonId, divId, badge, tooltip}, item)=>`
	<li class="nav-item" role="presentation">${
		tag('button', `
			${name} ${await item.template('badge', req, {content: badge})}		
		`, {
			title			: await item.template('tooltip-text', req, {fullName, details, tooltip}),
			id              : buttonId,
			'data-bs-target': '#'+divId,
			'aria-controls' : divId,
			'class'         : `nav-link ${isActive ? 'active': ''}`,
			'aria-selected' : isActive ? 'true': 'false',
			'data-bs-toggle': 'tab',
			type            : 'button',
			role            : 'tab',		
		})
	}</li>
`;