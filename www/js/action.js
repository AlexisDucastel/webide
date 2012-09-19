//=====================================================================
// Tree actions
//=====================================================================
function fileOnDblclick(e){
	openEditor( $(this).data('realpath') );
}

function refreshFolder(folder,onlyIfOpen){
    
    $('#cpTree .directory').each(function(){
        if($(this).data('realpath')==folder){
            if(onlyIfOpen && !$(this).hasClass('opened') ) return;
            if( $(this).hasClass('opened') ) $(this).click();
            $(this).click();
            return;
        }
    });
}

function gitInitSubmit(){
    var name=$('#gitInit [name=name]').val(),
        email=$('#gitInit [name=email]').val(),
        origin=$('#gitInit [name=origin]').val(),
        path=$('#gitInit [name=path]').val();
        
        
    api.gitInit(path,name,email,origin,function(data){
        if(!data) return statusLog(path+' : git init impossible','error');
        else return statusLog(path+' : git init ok','info');
    });
    $('#gitInit').hide();
    return false;
}



function gitCommit(path){
    var comment=prompt("Commentaire :","");
    if(!comment)return;
    
    api.gitCommit(path,comment,function(data){
        if(!data) return statusLog(path+' : git commit impossible','error');
        else return statusLog(path+' : git commit ok','info');
    });
}

function gitPush(path){
    api.gitPush(path,function(data){
        if(!data) return statusLog(path+' : git push impossible','error');
        else return statusLog(path+' : git push ok','info');
    });
    
}
function gitRevert(path){
    api.gitRevert(path,function(data){
        if(!data) return statusLog(path+' : git revert impossible','error');
        else return statusLog(path+' : git revert ok','info');
    });
}

function rename(path){
    var parent=path.replace(/\/$/,'').replace(/[^\/]+$/,'');
    var name=prompt("Nouveau nom :",(/\/([^\/]+)\/?$/).exec(path)[1]);
    if(!name)return;
    
    api.rename(path,name,function(data){
        if(!data) return statusLog(path+' : rename impossible','error');
        else statusLog(path+' :  rename ok','info');
        refreshFolder(parent);
    });
}

function changeMode(file,mode){
    api.changeMode(file,mode,function(data){
        if(!data) return statusLog(file+' : impossible de changer le mode en '+mode,'error');
        else return statusLog(file+' : chmod '+mode+' ok','info');
    });
}
function execute(file){
    api.execute(file,function(data){
        alert(data);
    });
}
vRoot=0;
function addVirtualRoot(){
    var url=prompt("Url du montage ?","ftp://");
    if(!url)return;
    
    vRoot++;
    name="mnt"+vRoot;
    
    api.addVirtualRoot(name,url,function(data){
        var newRoot=$('<div class="directory closed">').data('realpath','@'+name+'/')
            .append($('<img src="img/world_link.png" class="icon" title="">'))
            .append($('<span/>').text(' '+name));
        $("#cpTree").append(newRoot);
        newRoot.click( dirOnclick );
        addFolderActions(newRoot,{name:'@'+name+'/',parentPath:'',tags:[]});
    });
}
function uncompress(file){
    var parent=file.replace(/[^\/]+$/,'');
    api.uncompress(file,function(data){
        if(!data) return statusLog(file+' : décompression impossible','error');
        refreshFolder(parent);
    });
}
function wget(path){
	if(url=prompt('Url du fichier à télécharger ?','http://')){
        api.wget(path,url,function(data){
            if(!data) return statusLog(url+' : téléchargement impossible','error');
            refreshFolder(path);
        });
	}
}

function newFileFromPath(path){
	var f='';
	if(f=prompt('Nom de fichier ?','index.html')){
        api.createFile(path+f,function(data){
            if(!data) return statusLog(path+' : création du fichier '+f+' impossible','error');
            refreshFolder(path);
            openEditor(path+f);
        });
	}
}
function newFolderFromPath(path){
	var f='';
	if(f=prompt('Nom de dossier ?','')){
        api.createFolder(path+f,function(data){
            if(!data) return statusLog(path+' : création du dossier '+f+' impossible','error');
            refreshFolder(path);
        });
	}
}		
function deleteFileFromPath(path){
    var parent=path.replace(/[^\/]+$/,'');
    if(confirm('Etes-vous sur de vouloir supprimer le fichier '+path)){
		api.deleteFile(path,function(data){
            if(data) refreshFolder(parent);
            else statusLog(path+' : suppression impossible','error');
		});
	}
}
function deleteFolderFromPath(f){
    var parent=f.replace(/[^\/]+\/$/,'');
    if(confirm('Etes-vous sur de vouloir supprimer le dossier '+f)){
		api.deleteFolder(f,function(data){
            if(data){ refreshFolder(parent); }
            else statusLog(f+' : suppression impossible','error');
		});
	}
}