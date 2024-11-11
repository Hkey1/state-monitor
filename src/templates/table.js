module.exports   = async (req, {header, body, id, dataTables, width,isDataTablesNavHide})=>`
	<div class="sMon-table ${isDataTablesNavHide ? `sMon-table-noDtNav`:``}">
		<table class="smon-table table" id="${id}">
			<thead>${header}</thead>
			<tbody>${body}</tbody>
		</table>
		${dataTables ? `
			<script>new DataTable('#${id}', ${JSON.stringify(dataTables)});</script>
		`: ``}
	</div>
`
