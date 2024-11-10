module.exports = async (req, {header, body, id, dataTables})=>`
	<table class="smon-table table" id="${id}">
		<thead>${header}</thead>
		<tbody>${body}</tbody>
	</table>
	${dataTables ? `
		<script>new DataTable('#${id}', ${JSON.stringify(dataTables)});</script>
	`: ``}
`;