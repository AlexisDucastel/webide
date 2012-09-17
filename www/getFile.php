<?php
session_start();
require_once __DIR__."/../conf/config.php";

function unmq($s){
    return get_magic_quotes_gpc()?stripslashes($s):$s;
}

$file=unmq($_REQUEST['file']);
$file=virtualpathToReal($file);
$fp=fopen($file,"r");
if(isset($_REQUEST['fdl'])){
    header('Content-Disposition: attachment; filename="'.basename($file).'"');
}
$mime=@mime_content_type($file);
if(!$mime){
    $ex=explode('.',$file);
    switch(strtolower(array_pop($ex))){
        case 'jpg': $mime="image/jpeg"; break;
        case 'jpeg': $mime="image/jpeg"; break;
        case 'png': $mime="image/png"; break;
        case 'gif': $mime="image/gif"; break;
        case 'pdf': $mime="application/pdf"; break;
        default: $mime="application/octet-stream"; break;
    }
}

header('Content-Type: '.$mime);
fpassthru($fp);