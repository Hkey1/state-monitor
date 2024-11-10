module.exports = async (req, {sidebar, content, title, inlineCSS, inlineJS}, item)=>`
<html>	
	<head>
		<meta charset="UTF-8" />
		<title>${title}</title>
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous" />
		<link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.dataTables.css" />
		<style>${inlineCSS}</style>
	</head>
	<body>
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
		<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
		<script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
		<script>${inlineJS}</script>
		<div class="row">
			${sidebar}
			<div id="page-content" class="col smon-page-content">
				${content}
			</div>
		</div>
	</body>
</html>`;