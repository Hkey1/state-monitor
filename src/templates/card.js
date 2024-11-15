module.exports = async (req, {content, details, name, fullName, icon, badge, h, classes}, item)=>`
	<div class="sMon-card card ${classes||''}">
		<div class="card-body">
			${(name||fullName) ? `
				<div class="sMon-card-header">
					${await item.template('paragraph-title', req, {details, name, fullName, icon, badge, h, classes:'card-title sMon-card-title'})}
					<hr />
				</div>
			`:''}	
			<div class="card-text sMon-card-body">
				${content}
			</div>
		</div>
	</div>
`;