module.exports = async (req, {content, isSubHeader})=>`
	<tr class="sMon-infoTable-row ${isSubHeader ? `sMon-infoTable-subHeader` : ``}">
		${content}
	</tr>
`;