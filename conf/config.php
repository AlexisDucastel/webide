<?php
umask(0007);

define('PROJECT_WWW',$_SERVER['DOCUMENT_ROOT']);
define('PROJECT_ROOT','/data');
define('PROJECT_NAME','Web IDE');
define('PROJECT_USER',$_SERVER['REMOTE_USER']);

function virtualpathToReal($path){
    $path=trim($path);
    $path=preg_replace('/^\\/+/','',$path);
    if(preg_match('/\.\./',$path))error("No escape");
	
    if(substr($path,0,1)=="@"){
        
        preg_match('/^(@[^\\/]+)(\\/.*)$/',$path,$match);
        $path=$_SESSION['vroot'.$match[1]].$match[2];
    }
    else $path=PROJECT_ROOT."/$path";
	$path=preg_replace('/\\/+$/','',$path);

    return $path;
}
