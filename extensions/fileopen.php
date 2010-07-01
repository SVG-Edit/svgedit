<!doctype html>
<?php
	// Very minimal PHP file, all we do is Base64 encode the uploaded file and
	// return it to the editor
	$output = file_get_contents($_FILES['svg_file']['tmp_name']);
?>
<script>
window.top.window.svgEditor.processFile("<?php echo base64_encode($output); ?>", "<?php echo $_REQUEST['type'] ?>");
</script>  