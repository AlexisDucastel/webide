<?php
require_once __DIR__."/../lib/ajaxUpload.php";
require_once __DIR__."/../conf/config.php";

function unmq($s){
    return get_magic_quotes_gpc()?stripslashes($s):$s;
}

if(!isset($_REQUEST['path'])){
    die('{success:false}');
}

// list of valid extensions, ex. array("jpeg", "xml", "bmp")
$allowedExtensions = array();
// max file size in bytes
$sizeLimit = 10 * 1024 * 1024;

$uploader = new qqFileUploader($allowedExtensions, $sizeLimit);

$path = virtualpathToReal(unmq($_REQUEST['path']));


// Call handleUpload() with the name of the folder, relative to PHP's getcwd()
$result = $uploader->handleUpload("$path/");

echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);