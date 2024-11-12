module.exports = async (req, {sidebar, content, title, scripts, styles, icon, iconUrl}, item)=>`
<html>	
	<head>
		<meta charset="UTF-8" />
		<title>${title}</title>
		${styles}
		
		<!--
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous" />
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" integrity="sha384-tViUnnbYAV00FLIhhi3v/dWt3Jxw4gZQcNoSCxCIFNJVCx7/D55/wXsrNIRANwdD" crossorigin="anonymous">		
		<link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.dataTables.css" />
		${false && iconUrl ? `
			<link rel="icon" href="${iconUrl}" sizes="any" type="image/svg+xml" />
		`: ``}		
		-->
	</head>
	<body>
		${scripts}
		<!--
			<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
			<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
			<script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
		-->
		<div class="row">
			${sidebar}
			<div id="page-content" class="col smon-page-content">
				${content}
			</div>
		</div>
	</body>
</html>`;		//https://icons.getbootstrap.com/assets/icons/0-circle-fill.svg
