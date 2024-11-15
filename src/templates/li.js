module.exports = async (req, {content, details, name, fullName, icon, badge, h}, item)=>`
	<li>
		${(name||fullName) ? `
			<span class="sMon-li-header">
				${(await item.template('paragraph-title', req, {details, name, fullName, icon, badge, h:'b'})).trim()}:
			</span>
		`:''}	
		<span class="sMon-li-content">
			${content}
		</span>
	</li>
`;