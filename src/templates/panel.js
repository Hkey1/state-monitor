module.exports = async (req, {content, expand, id, name, fullName, details, badge, parentId, tooltip}, item)=>`
	<div class="accordion-item" id="${id}">
		<h2 class="accordion-header">
			<button 
				class="accordion-button ${expand ? ``: `collapsed`}" 
				${await item.template('tooltip-attr', req, {fullName, details, tooltip})}
				type="button" 
				data-bs-toggle="collapse" 
				data-bs-target="#${id}-content" 
				aria-controls="${id}-content"
				aria-expanded="${expand ? `true`: `false`}" 
			>
				${name}&nbsp;${await item.template('badge', req, {content: badge})}
			</button>
		</h2>
	    <div id="${id}-content" class="accordion-collapse collapse ${expand ? `show`: ``}" data-bs-parent="#${parentId}">
			<div class="accordion-body">
				${content}	
			</div>
		</div>
	</div>
`;