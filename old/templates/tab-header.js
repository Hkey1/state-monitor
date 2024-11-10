const tag = require('../Functions/tag.js');
module.exports = async (req, {content, isActive, buttonId, divId})=>`
	<li class="nav-item" role="presentation">${
		tag('button', content, {
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