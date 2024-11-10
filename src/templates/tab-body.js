module.exports = async (req, {isActive, content, divId, buttonId})=>`
	<div 
		class="tab-pane fade ${isActive ? 'show active': ''}" 
		id="${divId}"
		aria-labelledby="${buttonId}"
		role="tabpanel"
		tabindex="0"
	>${content}</div>
`; 