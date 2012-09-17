//=====================================================================
// Library
//=====================================================================
api={
	a:function(method,params,callback){
		if(params==null) params=[];
		if(callback==null)callback=function(){};
		$.ajax({
			url:'ajax.php',
			dataType:'json',
			type:'POST',
			data:{method:method,params:JSON.stringify(params)},
			success:function(data){
				callback(data);
			}
		});
	},
	ls:function(dir,callback){ return this.a('ls',[dir],callback); },
	ll:function(dir,callback){ return this.a('ll',[dir],callback); },
	getFile:function(file,callback){ return this.a('getFile',[file],callback); },
	setFile:function(file,content,callback){ return this.a('setFile',[file,content],callback); },
    createFile:function(file,callback){ return this.a('createFile',[file],callback); },
    createFolder:function(folder,callback){ return this.a('createFolder',[folder],callback); },
    deleteFile:function(file,callback){ return this.a('deleteFile',[file],callback); },
    deleteFolder:function(folder,callback){ return this.a('deleteFolder',[folder],callback); },
    movePath:function(srcPath,tgtPath,callback){ return this.a('movePath',[srcPath,tgtPath],callback); },
    wget:function(folder,url,callback){ return this.a('wget',[folder,url],callback); },
    uncompress:function(file,callback){ return this.a('uncompress',[file],callback); },
    execute:function(file,callback){ return this.a('execute',[file],callback); },
    changeMode:function(file,mode,callback){ return this.a('changeMode',[file,mode],callback); },
    exec:function(cmd,callback){ return this.a('exec',[cmd],callback); },
    addVirtualRoot:function(name,url,callback){ return this.a('addVirtualRoot',[name,url],callback); },
    gitCommit:function(path,comment,callback){ return this.a('gitCommit',[path,comment],callback); },
    gitPush:function(path,callback){ return this.a('gitPush',[path],callback); },
    gitRevert:function(path,callback){ return this.a('gitRevert',[path],callback); }
};