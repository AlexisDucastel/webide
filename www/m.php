<?php
require_once __DIR__."/../conf/config.php";

function unmq($s){
	return get_magic_quotes_gpc()?stripslashes($s):$s;
}




$path=(isset($_REQUEST['path'])?unmq($_REQUEST['path']):'/');

$path=trim($path);
$path=preg_replace('/^\\/+/','',$path);
$path=preg_replace('/^\\/+$/','',$path);
if(preg_match('/\.\./',$path))error("No escape");
$rpath=$path;
$path=PROJECT_ROOT."/$path";



?><html>
<head>
	<title>DevZone <?php echo PROJECT_NAME ?></title>
	<style>
		a { text-decoration: none; }
		img { position:relative; top: 3px; }
	</style>
</head>
<body>
<?php


//==============================================================================
// Saving file
//==============================================================================
if(isset($_REQUEST['file'])){
    $file=file_put_contents($path,unmq($_REQUEST['file'])) or die("Cannot save file $rpath");
    echo date("Y-m-d H:i:s")." $rpath saved ($file octets) ";
    
    if(in_array(substr($rpath,0,3),array('www','cgi')))
        echo '<a href="/'.substr($rpath,4).'">run</a><br>';
}


//==============================================================================
// Path is a folder
//==============================================================================
if(is_dir($path)){

	$dirList=array();
	$fileList=array();
	foreach( glob($path."/*") as $f ){
		if(is_dir($f)) $dirList[]=basename($f);
		else $fileList[]=basename($f);
	}
	sort($dirList);
	sort($fileList);

	if($rpath!='') echo '<img src="img/folder.png"> <a href="m.php?path='.urlencode(dirname($d)).'">..</a><br>'."\n";
	foreach($dirList as $d){
		echo '<img src="img/folder.png"> <a href="m.php?path='.urlencode("$rrath/$d").'">'.htmlspecialchars($d)."</a><br>\n";
	}
	foreach($fileList as $f){
		echo '<img src="img/page_white.png"> <a href="m.php?path='.urlencode("$rpath/$f").'">'.htmlspecialchars($f)."</a><br>\n";
	}
	exit();
}
//==============================================================================
// Path is a folder
//==============================================================================
else if(file_exists($path)){ ?>
	<form method="post">
        <input type="hidden" name="path" value="<?php echo htmlspecialchars($rpath); ?>">
		<textarea style="width:100%;height:100%;border:solid 1px silver;" name="file"><?php echo htmlspecialchars(file_get_contents($path)); ?></textarea><br>
		<input type="submit" name="store" value="Enregistrer">
		<input type="submit" name="storeAndView" value="Enregistrer et voir">
	</form>
	<?
	exit();
} 
//==============================================================================
// Path does not exists
//==============================================================================
else {
	die("$path does not exists !");
}

?>

</body>
</html>
