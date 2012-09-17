<?php
require_once __DIR__."/../conf/config.php";
?><html>
<head>

	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.21/jquery-ui.min.js"></script>
    <link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.0/themes/base/jquery-ui.css">

    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/dojo/1.8.0/dojo/dojo.js" data-dojo-config="parseOnLoad: true"></script>
    <link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/dojo/1.8/dojo/resources/dojo.css">
	<link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/dojo/1.8/dijit/themes/claro/claro.css">
 
	<script src="ajaxupload/fileuploader.js" type="text/javascript" charset="utf-8"></script>
    <link rel="stylesheet" type="text/css" href="ajaxupload/fileuploader.css">
    
	<script src="ace/ace.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/theme-merbivore.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/mode-javascript.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/mode-html.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/mode-css.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/mode-php.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/mode-perl.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/mode-sh.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/mode-xml.js" type="text/javascript" charset="utf-8"></script>
    
    
	<script src="js/jss.js" type="text/javascript" charset="utf-8"></script>
	<script src="js/action.js" type="text/javascript" charset="utf-8"></script>
	<script src="js/tree.js" type="text/javascript" charset="utf-8"></script>
	<script src="js/editor.js" type="text/javascript" charset="utf-8"></script>
	<script src="js/api.js" type="text/javascript" charset="utf-8"></script>
    
    <link rel="stylesheet" type="text/css" href="main.css">

	<script type="text/javascript">
		dojo.require("dijit.layout.BorderContainer");
		dojo.require("dijit.layout.TabContainer");
		dojo.require("dijit.layout.ContentPane");
        
		dojo.require("dijit.Menu");
		dojo.require("dijit.MenuItem");
		dojo.require("dijit.DropDownMenu");

		dojo.ready(function(){ libLoaded('dojo'); });
		$(function(){ 
            // Adding exact contains to jQuery
            $.expr[":"].econtains = function(obj, index, meta, stack){
                return (obj.textContent || obj.innerText || $(obj).text() || "").toLowerCase() == meta[3].toLowerCase();
            }
            libLoaded('jQuery'); 
    	});
		window.libToLoad={jQuery:true,dojo:true};
		function libLoaded(lib){
			window.libToLoad[lib]=false;
			for(var i in window.libToLoad) if(window.libToLoad[i]) return true;
			libLoadedCallback();
		}
		function libLoadedCallback(){
            statusLog('Libraries loaded');
			$('#projectRoot').click( dirOnclick );
			dijit.byId('cpTab').watch('selectedChildWidget',function(){
				var cpTab=$( dijit.byId('cpTab').selectedChildWidget.domNode );
				if(cpTab.data('focusCallback')!=null)cpTab.data('focusCallback')();
			});

            api.llPath('/',function(ll){
                if(ll.tags.indexOf('gitroot')>-1)$('#projectRoot .icon').attr('src','img/git.jpg');
                addFolderActions($('#projectRoot'),ll);
            });

			window.onbeforeunload = function(){ 
                var openTabList=dijit.byId('cpTab').getChildren();
                for(var i in openTabList){
                    if($(openTabList[i].domNode).data('modified'))
                        return "Quitter cette page va entrainer la perte des modifications non sauvergardées !\nVoulez-vous fermer et perdre vos travaux non sauves ?";
                }
			}
            
            $('#cpTab').droppable({
                //hoverClass: "dropDir",
                drop: function(e,ui){
                    if(!ui.draggable.hasClass('file'))return true;
                    openEditor(ui.draggable.data('realpath')); 
                }
    		});
            
            $('#projectRoot').click();
		}
        
        function statusLog(log,status){
            var d=new Date();
            log='['+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'] '+log;
            var color='black';
            switch(status){
                case 'error': color='red'; break;
                case 'warning': color='orange'; break;
                case 'info': color='blue'; break;
            }
            $('#status').children(':first').before( $('<div/>').html(log).css('color',color) );
        }

        function toggleHidden(){
            //if()
        }
        function toggleStatus(){
            $('#status').toggle();
            dijit.byId('bcMain').resize();
        }
        
        function execCmd(cmd,d){
            api.exec(cmd,function(result){
                d.html('').append( $('<pre style="background:black;color:white;padding:0;margin:0;"/>').text(result) );
            });
        }
        function openTerminal(){
            var cp=null;

			var cp=new dijit.layout.BorderContainer({
                title:'<img src="img/application_osx_terminal.png" style="height:14px;"> Terminal',
                closable:true
    		});
			dijit.byId('cpTab').addChild(cp);
			dijit.byId('cpTab').selectChild(cp);
            var jCp=$(cp.domNode);
            
            
			var display=new dijit.layout.ContentPane({
                region:'center',
                style:'padding:0;margin:0;border:none;font-face: monospace;'
            });
            cp.addChild(display);
            
            var cmd=new dijit.layout.ContentPane({
                style:"height:30px;padding:0;margin:0;border:none;",
                region:'bottom',
                splitter:true
            });
    		cp.addChild(cmd);
            
            var c=$(cmd.domNode);
            var d=$(display.domNode);
            
            c.append(
                $('<textarea style="height:100%;width:100%;"/>').keypress(function(e){
                    if(e.ctrlKey && ((e.keyCode || e.which) == 10)) execCmd( $(this).val(),d);
    			})
            );
            
        }
	</script>
</head>
<body class="claro">

<div data-dojo-type="dijit.layout.BorderContainer" id="bcMain" style="width:100%;height:100%;">

	<div data-dojo-type="dijit.layout.BorderContainer" id="bcMenu" region="left" style="width:200px;" splitter="true">

		<?php // Project Tree  ?>
		<div data-dojo-type="dijit.layout.ContentPane" id="cpTree" region="center" style="height:100px;padding:0;">
			<div class="directory closed" data-realPath="/" id="projectRoot"><img src="img/folders_explorer.png" class="icon" title=""> Project test</div>
		</div>
        
    	<div data-dojo-type="dijit.layout.ContentPane" id="cpHeader" region="bottom" style="height:20px;">
			<img class="clickable ghost" src="img/emotion_ghost.png" onclick="toggleHidden();">
            <img class="clickable" src="img/world_add.png" onclick="addVirtualRoot();">
			<img class="clickable" src="img/page_white_text.png" onclick="toggleStatus();">
			<img class="clickable" src="img/application_osx_terminal.png" onclick="openTerminal();">
		</div>
	</div>

	<?php // Tab Container  ?>
	<div data-dojo-type="dijit.layout.BorderContainer" id="cBc" region="center">
	    <div data-dojo-type="dijit.layout.TabContainer" id="cpTab" region="center"></div>
	    <div data-dojo-type="dijit.layout.ContentPane" id="status" region="bottom" style="display:none;height:80px;padding:3px;">
            <div>Starting ...</div>
        </div>
    </div>

</div>


</body>
</html>
