<?php
session_start();
require_once __DIR__."/../lib/fileperm.php";
require_once __DIR__."/../conf/config.php";

function to_utf8($in){
        if (is_array($in)) {
            foreach ($in as $key => $value) {
                $out[to_utf8($key)] = to_utf8($value);
            }
        } elseif(is_string($in)) {
            if(mb_detect_encoding($in,'UTF-8, ISO-8859-1') != "UTF-8")
                return utf8_encode($in);
            else
                return $in;
        } else {
            return $in;
        }
        return $out;
}

class Ajax{
    private function virtualpathToReal($path){
        return virtualpathToReal($path);
    }
    
    public function movePath($srcPath,$tgtPath){
        $srcPath=$this->virtualpathToReal($srcPath);
        $tgtPath=$this->virtualpathToReal($tgtPath);
        
        if(!is_dir($tgtPath))error("Target path $tgtPath does not exists");
        if(!is_dir($srcPath) && !file_exists($srcPath) )error("Source path $srcPath does not exists");
        
        $tgtPath.="/".basename($srcPath);
        
        return rename($srcPath,$tgtPath);
    }
	public function getFile($file){
		$file=$this->virtualpathToReal($file);
        
		if(!file_exists($file))error("No file $file");
		return to_utf8(file_get_contents($file));
	}
    
    
    
    public function gitCommit($path,$comment){
        $path=$this->virtualpathToReal($path);
        chdir( is_dir($path)?$path:dirname($path) );
        return shell_exec('git commit -a -m '.escapeshellarg($comment) .' '.$path);
    }
    public function gitPush($path){
        $path=$this->virtualpathToReal($path);
        chdir( is_dir($path)?$path:basename($path) );
        return shell_exec('git push -u origin master');
    }
    public function gitRevert($path){
        $path=$this->virtualpathToReal($path);
        chdir( is_dir($path)?$path:dirname($path) );
        $tld=trim(shell_exec('git rev-parse --show-toplevel'));
        chdir($tld);
        $relPath=str_replace($tld.'/','',$path);
        return shell_exec('git checkout HEAD -- '. escapeshellarg($relPath) .' 2>&1');
    }
	
    
    
    public function createFile($file){
        $file=$this->virtualpathToReal($file);
		
		if(file_exists($file))error("File $file exists !");
        
        if(!is_dir(dirname($file)))mkdir(dirname($file),0770,true);
        return (file_put_contents($file,'')!==false);
	}
	public function exec($cmd){
        chdir(PROJECT_ROOT);
        return shell_exec($cmd);
	}
	public function execute($file){
        $file=$this->virtualpathToReal($file);
        if(strpos($file,'"')!==false) error("No quote allowed");
		if(!file_exists($file))error("File $file dosn't exists !");
        return shell_exec($file);
	}
    
	public function changeMode($file,$mode){
        $file=$this->virtualpathToReal($file);
    	if(!file_exists($file))error("File $file dosn't exists !");
        
        $mode=intval($mode);
        if($mode<600)error("mode too low !");
        
        chdir($folder);
        
        $cmd='chmod "'.$mode.'" "'.$file.'" && echo "ok" ||echo "fail"';
        return trim(shell_exec($cmd))=="ok";
	}
	public function wget($folder,$url){
        $folder=$this->virtualpathToReal($folder);
		
		if(strpos($url,'"')!==false) error("No quote allowed");
		if(!is_dir($folder))error("Folder $folder dosn't exists !");
        
        chdir($folder);
        
        $cmd='/usr/bin/wget -q "'.$url.'" && echo "ok" ||echo "fail"';
        return trim(shell_exec($cmd))=="ok";
	}
    
	public function uncompress($file){
        $file=$this->virtualpathToReal($file);
        $folder=dirname($file);
        
        if(!file_exists($file))error("File $file doesn't exists !");
        if(strpos($file,'"')!==false) error("No quote allowed");
        
        chdir($folder);
        
        $p=explode('.',$file);
        switch( array_pop($p) ){
            case 'bz2': 
            case 'gz': 
                if(array_pop($p)=='tar'){
                    $cmd='/bin/tar -xf "'.$file.'"';
                    shell_exec($cmd);
                }
                break;
            case 'tgz': 
                $zip = new ZipArchive();
                if (!$zip->open($file)) error("Cannot open zip file");
                $zip->extractTo($folder);
                $zip->close();
                break;
            case 'zip': 
                $zip = new ZipArchive();
                if (!$zip->open($file)) error("Cannot open zip file");
                $zip->extractTo($folder);
                $zip->close();
                break;
            default:
                error('unsupported archive type');
                break;
        }
        
        return true;
	}
    
    public function createFolder($folder){
        $folder=$this->virtualpathToReal($folder);
    	
		if(is_dir($folder))error("Folder $folder exists !");
        
		return @mkdir($folder,0770,true);
	}
    
    public function deleteFile($file){
        $file=$this->virtualpathToReal($file);
        if(!file_exists($file))error("File $filer does not exists !");
        return @unlink($file);
    }
    
    public function deleteFolder($folder){
        $folder=$this->virtualpathToReal($folder);
        if(!is_dir($folder))error("Folder $folder does not exists !");
        
        chdir($folder);
        
        echo shell_exec('rm -R *');
        echo shell_exec('rm -R .*');
        return @rmdir($folder);
    }
    
	public function setFile($file,$content){
        $file=$this->virtualpathToReal($file);
		
		if(!file_exists($file))error("No file $file");
        $ctx=stream_context_create(array('ftp' => array('overwrite' => true)));
		return file_put_contents($file,$content,0,$ctx);
	}
	public function addVirtualRoot($name,$url){
        if(substr($url,0,7)=='sftp://')$url='ssh2.'.$url;
        $_SESSION['vroot@'.$name]=$url;
        return true;
	}

	public function ls($folder){
        $folder=$this->virtualpathToReal($folder);

		$dirList=array();
		$fileList=array();
        $scan=@scandir("$folder/");
        if(is_array($scan))foreach($scan as $f){
            if( in_array($f,array('.','..')) ) continue;
    		if(is_dir("$folder/$f")) $dirList[]=$f;
			else $fileList[]=$f;
		}
		sort($dirList);
		sort($fileList);
		return array(
			'dir'=>$dirList,
			'file'=>$fileList,
		);
	}
	public function ll($folder){
        $folder=$this->virtualpathToReal($folder);

		$dirTmpList=array();
		$fileTmpList=array();
        $scan=@scandir("$folder/");
        if(is_array($scan))foreach($scan as $f){
            if( in_array($f,array('.','..')) ) continue;
    		if(is_dir("$folder/$f")) $dirTmpList[]=$f;
			else $fileTmpList[]=$f;
		}
		sort($dirTmpList);
		sort($fileTmpList);
        
        $dirList=array();
        foreach($dirTmpList as $dir){
            $tags=array();
            if(is_dir("$folder/$dir/.git"))$tags[]="gitroot";
            $dirList[]=array(
                'perm'=>getFilePerm("$folder/$dir"),
                'name'=>$dir,
                'tags'=>$tags,
            );
        }
        $fileList=array();
        foreach($fileTmpList as $file){
            $tags=array();
            $fileList[]=array(
                'perm'=>getFilePerm("$folder/$file"),
                'name'=>$file,
                'tags'=>$tags,
            );
        }
        
		return array(
			'dir'=>$dirList,
			'file'=>$fileList,
		);
	}

	public function describe(){
		return get_class_methods(__CLASS__);
	}
}

//=============================================================================
// Auto code
//=============================================================================
function error($message){
	die(json_encode(array('error'=>$message)));
}

function unmq($s){
	return get_magic_quotes_gpc()?stripslashes($s):$s;
}

$method=unmq($_REQUEST['method']);
if($method=='')error('No method provided');
$params=unmq($_REQUEST['params']);
if($params!='')$params=json_decode($params);
else $params=array();

echo json_encode(
	call_user_func_array(array(new Ajax(),$method), $params)
);
