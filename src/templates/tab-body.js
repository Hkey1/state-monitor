module.exports = async (req, {isActive, content, divId, buttonId, details, name, fullName, icon, badge, h}, item)=>`
	<div 
		class="tab-pane fade ${isActive ? 'show active': ''}" 
		id="${divId}"
		aria-labelledby="${buttonId}"
		role="tabpanel"
		tabindex="0"
	>
		${((fullName && fullName!==name)||details) ? `
			<div class="sMon-tab-body-title">
				${await item.template('paragraph-title', req, {details, name, fullName, icon, badge, h})}
			</div>
		`:``}
		${content}
	</div>
`; 