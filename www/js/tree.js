//=== FOLDER actions binding ===========================================

function addFolderActions(f,folder){
    var path=folder.parentPath+folder.name+'/';
    if(folder.name.substr(0,1)=='.') f.addClass('hidden');
    
    // Ajax upload
    var uploader = new qq.FileUploader({
        element: $('<div/>')[0],
        action: 'upload.php',
        debug: true,
        extraDropzones: [f[0]],
        params:{ path:path },
        onComplete:function(id, fileName, responseJSON){
            if(responseJSON.success){
                refreshFolder(path,true);
                statusLog("Fichier "+fileName+" uploadé dans "+path,'info');
            }
            else statusLog("Problème lors de l'envoi de "+fileName,'error');
            
        }
    }); 
    
    // Contextual menu
    var cMenu;
    pMenu = new dijit.Menu();
    
    pMenu.addChild(new dijit.MenuItem({
        label: '<img src="img/page_white_add.png" class="icon"> Nouveau fichier',
        onClick:function(){ newFileFromPath(path); }
    }));
    pMenu.addChild(new dijit.MenuItem({
        label: '<img src="img/folder_add.png" class="icon"> Nouveau dossier',
        onClick:function(){ newFolderFromPath(path); }
    }));
    if(!(path.replace(/^@[^/]+/,'')=='/')){
        pMenu.addChild(new dijit.MenuItem({
            label: '<img src="img/bin_empty.png" class="icon"> Supprimer',
            onClick:function(){ deleteFolderFromPath(path); }
        }));
    }
    else if(path.substr(0,1)=='@'){
        
    }
    
    pMenu.addChild(new dijit.MenuSeparator());
    
    var gitSubMenu = new dijit.Menu();
        gitSubMenu.addChild(new dijit.MenuItem({
            label: '<img src="img/arrow_up.png" class="icon"> push',
            onClick:function(){ gitPush(path); },
            disabled: (path.substr(0,1)=='@')
        }));
        gitSubMenu.addChild(new dijit.MenuItem({
            label: '<img src="img/accept.png" class="icon"> commit',
            onClick:function(){ gitCommit(path); },
            disabled: (path.substr(0,1)=='@')
        }));
        gitSubMenu.addChild(new dijit.MenuItem({
            label: '<img src="img/arrow_rotate_clockwise.png" class="icon"> revert',
            onClick:function(){ gitRevert(path); },
            disabled: (path.substr(0,1)=='@')
        }));
    pMenu.addChild(new dijit.PopupMenuItem({
        label: '<img src="img/git.jpg" class="icon"> git',
        popup: gitSubMenu,
        disabled: (path.substr(0,1)=='@')
    }));
    
    pMenu.addChild(new dijit.MenuSeparator());
    
    pMenu.addChild(new dijit.MenuItem({
        label: '<img src="img/inbox_download.png" class="icon"> Télécharger ici',
        onClick:function(){ 
            wget(path);
        },
        disabled: (path.substr(0,1)=='@')
    }));
    
    pMenu.bindDomNode(f[0]);
    pMenu.startup();
    
    // Click no select
    f.disableSelection();
    
    // File moving
    f.droppable({
        hoverClass: "dropDir",
        drop: function(e,ui){
            var srcDir=ui.draggable.parent().prev().data('realpath');
            var srcPath=ui.draggable.data('realpath');
            var tgtPath=$(this).data('realpath');
            if(srcDir==tgtPath)return true;
            if(confirm("Confirmer le déplacement de "+srcPath+" vers "+tgtPath+" ?")){
                api.movePath(srcPath,tgtPath,function(data){
                    ui.draggable.draggable("option","revert",false);
                    ui.draggable.draggable("option","stop",function(){
                        refreshFolder(srcDir,true);
                        refreshFolder(tgtPath,true);
                    });
                });
            }
        }
	});
}
function addFileActions(f,file){
    var path=file.parentPath+file.name;
    
    if(file.name.substr(0,1)=='.') f.addClass('hidden');
    
    // Contextual menu
    var cMenu;
    pMenu = new dijit.Menu();
    
    var ext=path.split('.').pop()
    switch(ext){
        case 'bz2':
        case 'tgz':
        case 'gz':
        case 'zip':
            pMenu.addChild(new dijit.MenuItem({
                label: '<img src="img/compress.png" class="icon"> Decompresser',
                onClick:function(){ uncompress(path); },
                disabled: (path.substr(0,1)=='@')
            }));
            break;
        case 'sh':
            pMenu.addChild(new dijit.MenuItem({
                label: '<img src="img/control_play_blue.png" class="icon"> Executer',
                onClick:function(){ execute(path); },
                disabled: (path.substr(0,1)=='@')
            }));
            break;
        default:
            pMenu.addChild(new dijit.MenuItem({
                label: '<img src="img/page_white_edit.png" class="icon"> Editer',
                onClick:function(){ openEditor(path); }
            }));
    }
    
    pMenu.addChild(new dijit.MenuItem({
        label: '<img src="img/inbox_download.png" class="icon"> Télécharger',
        onClick:function(){ window.open('getFile.php?fdl=1&file='+encodeURIComponent(path),'_blank'); }
    }));
    
    pMenu.addChild(new dijit.MenuItem({
        label: '<img src="img/bin_empty.png" class="icon"> Supprimer',
        onClick:function(){ deleteFileFromPath(path); }
    }));
    
    
    pMenu.addChild(new dijit.MenuSeparator());
    var gitSubMenu = new dijit.Menu();
        gitSubMenu.addChild(new dijit.MenuItem({
            label: '<img src="img/accept.png" class="icon"> commit',
            onClick:function(){ gitCommit(path); },
            disabled: (path.substr(0,1)=='@')
        }));
        gitSubMenu.addChild(new dijit.MenuItem({
            label: '<img src="img/arrow_rotate_clockwise.png" class="icon"> revert',
            onClick:function(){ gitRevert(path); },
            disabled: (path.substr(0,1)=='@')
        }));
    pMenu.addChild(new dijit.PopupMenuItem({
        label: '<img src="img/git.jpg" class="icon"> git',
        popup: gitSubMenu,
        disabled: (path.substr(0,1)=='@')
    }));
    
    pMenu.addChild(new dijit.MenuSeparator());
    
    var chmodSubMenu = new dijit.Menu();
    chmodSubMenu.addChild(new dijit.MenuItem({
        label: "standard",
        onClick:function(){ changeMode(path,644); },
        disabled: (path.substr(0,1)=='@')
    }));
    chmodSubMenu.addChild(new dijit.MenuItem({
        label: "standard privé",
        onClick:function(){ changeMode(path,600); },
        disabled: (path.substr(0,1)=='@')
    }));
    chmodSubMenu.addChild(new dijit.MenuItem({
        label: "executable",
        onClick:function(){ changeMode(path,744); },
        disabled: (path.substr(0,1)=='@')
    }));
    chmodSubMenu.addChild(new dijit.MenuItem({
        label: "executable privé",
        onClick:function(){ changeMode(path,700); },
        disabled: (path.substr(0,1)=='@')
    }));
    pMenu.addChild(new dijit.PopupMenuItem({
        label: "chmod",
        popup: chmodSubMenu,
        disabled: (path.substr(0,1)=='@')
    }));
    
    
    pMenu.bindDomNode(f[0]);
    pMenu.startup();
    
    f.disableSelection();
}

function setMovable(f){
     f.draggable({ 
        revert: true,
        distance: 10,
        appendTo: "body",
        helper:'clone',
        start:function(){
            $(this).addClass('dragging');
        },
        stop:function(){
            $(this).removeClass('dragging');
        }
    });
}

function dirOnclick(e){
	var t=$(this);
    if(t.hasClass('dragging'))return false;
	var parentPath=t.data('realpath')
	if(t.hasClass('closed')){
		var d=$('<div/>').addClass('dirContent');
		t.append(' <img class="loading" src="img/loading.gif" />');
		api.ll(parentPath,function(data){
            
            if( (data.dir.length + data.file.length)==0){
                $('<span style="color:silver;font-style:italic;" class="file">vide</span>').appendTo(d);
            }
            else {
				for(var i in data.dir){
					var dir=data.dir[i];
                    dir.parentPath=parentPath;
                    var icon='img/folder.png';
                    if(dir.tags.indexOf('gitroot')>-1){
                        icon='img/git.jpg';
                    }
					var content='';
					content+='<img src="'+icon+'" class="icon" title=""> '+dir.name;
					var f=$('<div class="directory closed"/>').click(dirOnclick)
						.data('realpath',parentPath+dir.name+'/')
						.html(content).appendTo(d);
					addFolderActions(f,dir);
                    
                    setMovable(f);
				}
				for(var i in data.file){
					var file=data.file[i];
                    file.parentPath=parentPath;
					var content='';
					var icon="page_white";
                    switch(file.name.split('.').pop()){
                        case 'gz': 
                        case 'zip': icon="compress"; break;
                        
                        case 'gif': 
                        case 'jpeg': 
                        case 'jpg': 
                        case 'png': icon="images"; break;
                        case 'txt': icon="page_white_text"; break;
                        case 'htpasswd': 
                        case 'htdigest': icon="group_key"; break;
                        case 'htaccess': icon="page_white_gear"; break;
                        case 'php': icon="page_white_php"; break;
                        case 'sh': icon="page_white_tux"; break;
                        case 'js': icon="page_white_lightning"; break;
                        case 'html':
                        case 'html': icon="page_white_code"; break;
                        case 'css': icon="page_white_code_red"; break;
		            }
					content+='<img src="img/'+icon+'.png" class="icon" title=""> '+file.name;
					var f=$('<div class="file"/>')
                        .data('realpath',parentPath+file.name)
                        .html(content).appendTo(d);
                        
					addFileActions(f,file);
                    
                    setMovable(f);
				}
            }
			t.find('.loading').remove();
		});
		t.after( d ).removeClass('closed').addClass('opened');
	}
	else {
		t.removeClass('opened').addClass('closed').next().remove();
	}
}