module.exports = async (req, {content, details, name, fullName, icon, badge, h, isActive}, item)=>{
	content    = content ? content.trim() : '';
	fullName ||= name;
	active = isActive ? 'active' : '';
	if(content && fullName){
		badge = badge ? `<span class="badge text-bg-primary rounded-pill">${badge}</span>`: '';
		return `
			<li class="list-group-item d-flex justify-content-between align-items-start ${active}">
				<div class="ms-2 me-auto">
					<div class="fw-bold">${fullName}</div>
					${content}
				</div>
				${badge}
			</li>
		`;
	} else {
		let title = '';
		if(fullName){
			title = (await item.template('paragraph-title', req, {details, name, fullName, icon, badge, h:'b'})).trim();
			title = `<span class="sMon-listItem-header">${title}:</span>` 
		}
		return `
			<li class="list-group-item ${active}">
				${title}
				<span class="sMon-listItem-content">${content}</span>
			</li>
		`;
	}
};
