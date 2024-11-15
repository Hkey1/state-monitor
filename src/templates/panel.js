module.exports = async (req, {content, isActive, id, name, fullName, details, badge, parentId, tooltip, isInCol, hideable, icon}, item)=>`
	<div class="accordion-item ${isInCol ? 'sMon-panel-inCol': ''} ${hideable ?``:`not-hideable`}" id="${id}">
		${(name||fullName) ? `
			<h2 class="accordion-header">
				<button 
					class="accordion-button ${isActive ? ``: `collapsed`}" 
					${await item.template('tooltip-attr', req, {fullName, details, tooltip})}
					type="button" 
					${hideable?` 
						data-bs-toggle="collapse"
						data-bs-target="#${id}-content" 
						aria-controls="${id}-content"
					`: ``} 
					aria-expanded="${isActive ? `true`: `false`}" 
				>
					${icon ? (await item.template('icon', req, {content: icon}))+'&nbsp;' : ''}
					${name||fullName}&nbsp;
					${await item.template('badge', req, {content: badge})}
				</button>
			</h2>
		`:''} 
	    <div id="${id}-content" class="accordion-collapse collapse ${isActive ? `show`: ``}" ${hideable?`data-bs-parent="#${parentId}"`:``}>
			<div class="accordion-body">
				${content}	
			</div>
		</div>
	</div>
`;


