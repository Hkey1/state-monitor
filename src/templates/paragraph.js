module.exports = async (req, {content, details, name, fullName, icon, badge, h}, item)=>`
	<div class="sMon-paragraph">
		${(name||fullName) ? `
			<div class="sMon-paragraph-title">
				${await item.template('paragraph-title', req, {details, name, fullName, icon, badge, h})}
			</div>
		`:``}
		<p class="sMon-paragraph-content">
			${content}
		</p>
	</div>
`;