
function openViewer(url,refreshIfExist){
	var bc=null;

    // Recherche d'un navigateur existant
    $('.viewPane').each(function(){ if($(this).data('viewing')==url)bc=this.id; });
    if(bc!==null){
        dijit.byId('cpTab').selectChild( dijit.byId(bc) );
		$('#'+bc).find('.refresh').click();
        return true;
    }

	bc=new dijit.layout.BorderContainer({title:'<img src="img/control_play_blue.png" style="height:14px;"> '+url,closable:true,gutters:false,liveSplitters:false});

	var menu=new dijit.layout.ContentPane({region:'top',style:'height:25px'});
	var content=new dijit.layout.ContentPane({region:'center',style:'padding-top:0'});

	var iframe=$('<iframe />').attr('src',url).css({width:'99%',height:'99%',margin:0,padding:0});
    $(content.domNode).append(iframe).css({border:'none'});
	$(menu.domNode).addClass("viewMenu").css({border:'none'});

	dijit.byId('cpTab').addChild(bc);
	bc.addChild(menu);
	bc.addChild(content);
	$(bc.domNode).data('viewing',url).addClass('viewPane');
    dijit.byId('cpTab').selectChild(bc);

	var address=$('<input type="text" style="width:80%">').val(url).keypress(function(e){
        if ((e.keyCode || e.which) == 13) iframe.attr('src',$(this).val());
	});
	$(menu.domNode).append(address).append(
		$('<img src="img/control_play_blue.png" class="refresh" title="Go" />').click(function(){
			iframe.attr('src',address.val());
		}).css({
			cursor:'pointer',
			position:'relative',
			marginLeft:'5px',
			top:'4px'
		})
	).append(
		$('<img src="img/world_go.png" class="refresh" title="Open in new window" />').click(function(){
			window.open(address.val(),url);
		}).css({
			cursor:'pointer',
			position:'relative',
			marginLeft:'5px',
			top:'4px'
		})
	);

}

function changeEditorState(cp,file,modified){
    var color= modified?'#A00':'black';
    cp.set('title','<img src="img/page_edit.png" style="height:14px;"> <span style="color:'+color+'">'+file+'</span>');
    $(cp.domNode).attr('title','');
    $(cp.domNode).data('modified',modified);
    
}
//=====================================================================
// File Editor
//=====================================================================
function openEditor(file){
	var cp=null;

	//--- Recherche d'un éditeur existant ------------------------------
	$('.editPane').each(function(){ if($(this).data('editing')==file)cp=this.id; });
	if(cp!==null){
		dijit.byId('cpTab').selectChild( dijit.byId(cp) );
		return true;
	}

	//--- Sinon on crée l'éditeur --------------------------------------
    var fileExt=file.split('.').pop();

	cp=new dijit.layout.BorderContainer({
        title:'<img src="img/page_edit.png" style="height:14px;"> '+file,
        closable:true,
        onClose: function(){
            if(!$(this.domNode).data('modified'))return true;
            return confirm("Attention, vous avez modifié le fichier "+file+" sans enregistrer !\nVoulez-vous fermer l'onglet et perdre les modifications ?");
        }
	});
	dijit.byId('cpTab').addChild(cp);
	dijit.byId('cpTab').selectChild(cp);
    var jCp=$(cp.domNode);
    var url='getFile.php?file='+encodeURIComponent(file);
    switch(fileExt){
        case 'jpg':
        case 'png':
        case 'gif':
        case 'pdf':
            jCp.append( $('<iframe/>').attr('src',url).css({width:'100%',height:'100%'}) ) ;
            //jCp.append( $('<img/>').attr('src',url).css({maxWidth:'100%',maxHeight:'100%'}) ) ;
            return true;
        case 'bz2':
        case 'gz':
        case 'zip':
        case '7z':
            jCp.append( $('<a/>').attr('href',url).text(file) ) ;
            return true;
        default :
            break;
    }
    
    var dMenu=new dijit.layout.ContentPane({
        style:"height:18px;padding:0;margin:0;border:none;",
        region:'top'
	});
	var menu=$(dMenu.domNode).addClass("editMenu");
	cp.addChild(dMenu);
    
    var dAceDiv=new dijit.layout.ContentPane({
        region:'center',
        style:'padding:0;margin:0;border:none;'
    });
    
	var aceDiv=$('<div/>').addClass('editor').css({width:'100%',height:'100%'});
    $(dAceDiv.domNode).append(aceDiv);
    cp.addChild(dAceDiv);

	jCp.addClass('editPane');
	jCp.data('editing',file);

	var aceEditor = ace.edit(aceDiv[0]);
	jCp.data('aceEditor',aceEditor);
    aceEditor.setTheme("ace/theme/merbivore");
    
    
    changeEditorState(cp,file,false);
    
    aceEditor.on('change',function(){
        changeEditorState(cp,file,true);
        
        // Preparation for auto-complete
        jCp.data('keywords',$.unique( (' '+aceEditor.getValue()+' ').replace(/("[^"]*")/g,'').replace(/('[^']*')/g,'')
            .replace(/[^a-zA-Z0-9]/g,' ')
            .replace(/\s+/g,' ')
            .replace(/\s(.|..|[0-9]+)\s/g,'')
            .split(' ')
        ));
    });

	jCp.data('focusCallback',function(){ aceEditor.focus(); });

	var mode="ace/mode/text";
	switch(fileExt){
		case 'sh': mode="ace/mode/sh"; break;
		case 'js': mode="ace/mode/javascript"; break;
		case 'php': mode="ace/mode/php"; break;
		case 'htm':
		case 'html': mode="ace/mode/html"; break;
		case 'css': mode="ace/mode/css"; break;
		case 'xml': mode="ace/mode/xml"; break;
		case 'pl': mode="ace/mode/perl"; break;
	}
    aceEditor.getSession().setMode(new (ace.require(mode)).Mode());

	api.getFile(file,function(content){ if(!content.error);aceEditor.getSession().setValue(content);changeEditorState(cp,file,false); });

	dojo.connect(cp, "resize",function(size){
        /*aceDiv.css({
			width:(size.w - 20) + 'px',
			height:(size.h - 50) + 'px'
		});*/
		aceEditor.resize();
    });

    //--- Menu toolbar -------------------------------------------------
	var type=file.substr(1,3);

	var menuSave=$('<img src="img/disk.png" title="Enregistrer" class="item"/>');
	menu.append(menuSave);
	menuSave.click(function(){
		menuSave.attr('src','img/loading.gif');
		api.setFile(file,aceEditor.getSession().getValue(),function(success){
			if(!success)statusLog(file+' : enregistrement impossible','error');
            changeEditorState(cp,file,false);
			menuSave.attr('src','img/disk.png');
		});
	});
    

	if( (new Array('www','cgi')).indexOf(type) > -1){
		var menuRun=$('<img src="img/control_play_blue.png" title="Lancer" class="item"/>');
		menu.append(menuRun);
		menuRun.click(function(){
			menuSave.click();
			var url=file;
			switch(type){
				case 'www': url='/'+ file.substring(5); break;
				default: break; // do nothing;
			}

			openViewer(url);
		});
		aceEditor.commands.addCommand({
            name: "run",
            bindKey: {win: "F9", mac: "F9"},
            exec: function() { menuRun.click(); }
		});

	}
    
    var menuDownload=$('<a><img src="img/box_down.png" title="Télécharger" class="item"/></a>')
        .attr('href','getFile.php?fdl=1&file='+encodeURIComponent(file));
    menu.append(menuDownload);
    
    var anchorsKey={a:'1',b:'2',c:'3',d:"4",e:'5'};
    var anchors={a:null,b:null,c:null,d:null,e:null};
    
    function bindAnchor(anchors,a,key){
        aceEditor.commands.addCommand({
            name: "setAnchor"+a,
            bindKey: {win: "Ctrl-Shift-"+key, mac: "Command-Shift-"+key},
            exec: function() {
                var p=aceEditor.getCursorPosition();
                delete anchors[a];
                anchors[a]=aceEditor.getSession().doc.createAnchor(p.row,p.column);
                aceEditor.focus();
                
                // var marker = aceEditor.getSession().addMarker(p,"ace_active_line","line");
            }
		});
        aceEditor.commands.addCommand({
            name: "gotoAnchor"+a,
            bindKey: {win: "Ctrl-"+key, mac: "Command-"+key},
            exec: function() {
                if(anchors[a]!=null){
                    var p=anchors[a].getPosition();
                    aceEditor.gotoLine(p.row+1,p.column,true);
                    aceEditor.focus();
                }
            }
		});
    }
    for(var i in anchors) bindAnchor(anchors,i,anchorsKey[i]);
    
    aceEditor.commands.addCommand({
        name: "autoComp",
        bindKey: {win: "Ctrl-Space", mac: "Command-Space"},
        exec: function() { 
            console.log(jCp.data('keywords').length);
        }
    });
    
    //--- Custom Key Binding -------------------------------------------
    aceEditor.commands.addCommand({
        name: "duplicateLine",
        bindKey: {win: "Ctrl-D", mac: "Command-D"},
        exec: function() { aceEditor.copyLinesDown(); }
	});
    aceEditor.commands.addCommand({
        name: "duplicateLine",
        bindKey: {win: "Ctrl-D", mac: "Command-D"},
        exec: function() { aceEditor.copyLinesDown(); }
	});
	
	aceEditor.commands.addCommand({
        name: "deleteLine",
        bindKey: {win: "Ctrl-Y", mac: "Command-Y"},
        exec: function() { aceEditor.removeLines(); }
	});
	
	aceEditor.commands.addCommand({
        name: "searchNext",
        bindKey: {win: "F3", mac: "F3"},
        exec: function() { aceEditor.findNext(); }
	});
	var isFs=false;
	aceEditor.commands.addCommand({
        name: "fullScreen",
        bindKey: {win: "Shift-F11", mac: "Shift-F11"},
        exec: function() { 
            if(isFs){
                $(dAceDiv.domNode).append(aceDiv);
                $('#fs').remove();
                aceEditor.resize();
                aceEditor.focus();
                isFs=false;
            }
            else {
                var jFs=$('<div id="fs"/>').css({
                    position:'fixed',
                    width:'100%',
                    height:'100%',
                    top:0,left:0
                });
                $('body').append( jFs );
                jFs.append(aceDiv);
                aceDiv.css({width:'100%',height:'100%'});
                aceEditor.resize();
                aceEditor.focus();
                isFs=true;
            }
            
        }
	});
	
	aceEditor.commands.addCommand({
        name: "gotoLine",
        bindKey: {win: "Ctrl-G", mac: "Command-G"},
        exec: function() { 
            var pos=aceEditor.getCursorPosition();
            var nLine=prompt("Goto line :",pos.line);
            if(nLine!==false)aceEditor.gotoLine(parseInt(nLine)+1,pos.column,true);
            
        }
	});
    
	aceEditor.commands.addCommand({
        name: "save",
        bindKey: {win: "Ctrl-S", mac: "Command-S"},
        exec: function() { menuSave.click(); }
	});
    
    // file extension dependant command
    if((new Array('php','js','html','htm')).indexOf(fileExt)>-1){
        aceEditor.commands.addCommand({
            name: "htmlBr",
            bindKey: {win: "Ctrl-Return", mac: "Command-Return"},
            exec: function() { aceEditor.insert("<br>"); }
		});
    }
    
    //setFontSize('20px');
    //aceDiv.scroll(function(e){
    //     console.log(e,'ca scroll !');
    //});
    
	dijit.byId('cpTab').resize();
	aceEditor.focus();
    
    window.lastAce=aceEditor;
}