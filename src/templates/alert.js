module.exports = async (req, {content, style, name, fullName, icon, badge})=>`
	<div class="sMon-alert alert alert-${style||'danger'}">
		${(name||fullName) ? `
			<div class="sMon-card-header">
				${await item.template('paragraph-title', req, {details, name, fullName, icon, badge, h: 'b', classes:'alert-title sMon-alert-title'})}
			</div>
		`:''}	
		${content}
	</div>
`;