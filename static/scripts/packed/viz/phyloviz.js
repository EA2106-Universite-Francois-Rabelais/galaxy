define(["libs/d3","viz/visualization","mvc/data"],function(m,f,g){var l=Backbone.View.extend({className:"UserMenuBase",isAcceptableValue:function(q,o,n){var r=q.val(),s=q.attr("displayLabel")||q.attr("id").replace("phyloViz","");function p(t){return !isNaN(parseFloat(t))&&isFinite(t)}if(!p(r)){alert(s+" is not a number!");return false}if(r>n){alert(s+" is too large.");return false}else{if(r<o){alert(s+" is too small.");return false}}return true},hasIllegalJsonCharacters:function(n){if(n.val().search(/"|'|\\/)!==-1){alert("Named fields cannot contain these illegal characters: double quote(\"), single guote('), or back slash(\\). ");return true}return false}});function h(){var w=this,r=m.layout.hierarchy().sort(null).value(null),v=360,q="Linear",u=18,s=200,t=0,p=0.5,n=50;w.leafHeight=function(x){if(typeof x==="undefined"){return u}else{u=x;return w}};w.layoutMode=function(x){if(typeof x==="undefined"){return q}else{q=x;return w}};w.layoutAngle=function(x){if(typeof x==="undefined"){return v}if(isNaN(x)||x<0||x>360){return w}else{v=x;return w}};w.separation=function(x){if(typeof x==="undefined"){return s}else{s=x;return w}};w.links=function(x){return m.layout.tree().links(x)};w.nodes=function(A,y){if(toString.call(A)==="[object Array]"){A=A[0]}var z=r.call(w,A,y),x=[],C=0,B=0;window._d=A;window._nodes=z;z.forEach(function(D){C=D.depth>C?D.depth:C;x.push(D)});x.forEach(function(D){if(!D.children){B+=1;D.depth=C}});u=q==="Circular"?v/B:u;t=0;o(x[0],C,u,null);return x};function o(B,D,A,z){var y=B.children,x=0;var C=B.dist||p;C=C>1?1:C;B.dist=C;if(z!==null){B.y0=z.y0+C*s}else{B.y0=n}if(!y){B.x0=t*A;t+=1}else{y.forEach(function(E){E.parent=B;x+=o(E,D,A,B)});B.x0=x/y.length}B.x=B.x0;B.y=B.y0;return B.x0}return w}var b=f.Visualization.extend({defaults:{layout:"Linear",separation:250,leafHeight:18,type:"phyloviz",title:"Title",scaleFactor:1,translate:[0,0],fontSize:12,selectedNode:null,nodeAttrChangedTime:0},initialize:function(n){this.set("dataset",new g.Dataset({id:n.dataset_id}))},root:{},toggle:function(n){if(typeof n==="undefined"){return}if(n.children){n._children=n.children;n.children=null}else{n.children=n._children;n._children=null}},toggleAll:function(n){if(n.children&&n.children.length!==0){n.children.forEach(this.toggleAll);toggle(n)}},getData:function(){return this.root},save:function(){var n=this.root;o(n);function o(q){delete q.parent;if(q._selected){delete q._selected}if(q.children){q.children.forEach(o)}if(q._children){q._children.forEach(o)}}var p=jQuery.extend(true,{},this.attributes);p.selectedNode=null;show_message("Saving to Galaxy","progress");return $.ajax({url:this.url(),type:"POST",dataType:"json",data:{config:JSON.stringify(p),type:"phyloviz"},success:function(q){hide_modal()}})}});var d=Backbone.View.extend({defaults:{nodeRadius:4.5},stdInit:function(o){var n=this;n.model.on("change:separation change:leafHeight change:fontSize change:nodeAttrChangedTime",n.updateAndRender,n);n.vis=o.vis;n.i=0;n.maxDepth=-1;n.width=o.width;n.height=o.height},updateAndRender:function(p){var o=m.select(".vis"),n=this;p=p||n.model.root;n.renderNodes(p);n.renderLinks(p);n.addTooltips()},renderLinks:function(n){var w=this;var o=w.diagonal;var p=w.duration;var r=w.layoutMode;var t=w.vis.selectAll("g.completeLink").data(w.tree.links(w.nodes),function(x){return x.target.id});var v=function(x){x.pos0=x.source.y0+" "+x.source.x0;x.pos1=x.source.y0+" "+x.target.x0;x.pos2=x.target.y0+" "+x.target.x0};var u=t.enter().insert("svg:g","g.node").attr("class","completeLink");u.append("svg:path").attr("class","link").attr("d",function(x){v(x);return"M "+x.pos0+" L "+x.pos1});var s=t.transition().duration(500);s.select("path.link").attr("d",function(x){v(x);return"M "+x.pos0+" L "+x.pos1+" L "+x.pos2});var q=t.exit().remove()},selectNode:function(o){var n=this;m.selectAll("g.node").classed("selectedHighlight",function(p){if(o.id===p.id){if(o._selected){delete o._selected;return false}else{o._selected=true;return true}}return false});n.model.set("selectedNode",o);$("#phyloVizSelectedNodeName").val(o.name);$("#phyloVizSelectedNodeDist").val(o.dist);$("#phyloVizSelectedNodeAnnotation").val(o.annotation||"")},addTooltips:function(){$(".tooltip").remove();$(".node").attr("data-original-title",function(){var o=this.__data__,n=o.annotation||"None";return o?(o.name?o.name+"<br/>":"")+"Dist: "+o.dist+" <br/>Annotation: "+n:""}).tooltip({placement:"top",trigger:"hover"})}});var a=d.extend({initialize:function(o){var n=this;n.margins=o.margins;n.layoutMode="Linear";n.stdInit(o);n.layout();n.updateAndRender(n.model.root)},layout:function(){var n=this;n.tree=new h().layoutMode("Linear");n.diagonal=m.svg.diagonal().projection(function(o){return[o.y,o.x]})},renderNodes:function(n){var u=this,v=u.model.get("fontSize")+"px";u.tree.separation(u.model.get("separation")).leafHeight(u.model.get("leafHeight"));var q=500,o=u.tree.separation(u.model.get("separation")).nodes(u.model.root);var p=u.vis.selectAll("g.node").data(o,function(w){return w.name+w.id||(w.id=++u.i)});u.nodes=o;u.duration=q;var r=p.enter().append("svg:g").attr("class","node").on("dblclick",function(){m.event.stopPropagation()}).on("click",function(w){if(m.event.altKey){u.selectNode(w)}else{if(w.children&&w.children.length===0){return}u.model.toggle(w);u.updateAndRender(w)}});if(toString.call(n)==="[object Array]"){n=n[0]}r.attr("transform",function(w){return"translate("+n.y0+","+n.x0+")"});r.append("svg:circle").attr("r",0.000001).style("fill",function(w){return w._children?"lightsteelblue":"#fff"});r.append("svg:text").attr("class","nodeLabel").attr("x",function(w){return w.children||w._children?-10:10}).attr("dy",".35em").attr("text-anchor",function(w){return w.children||w._children?"end":"start"}).style("fill-opacity",0.000001);var s=p.transition().duration(q);s.attr("transform",function(w){return"translate("+w.y+","+w.x+")"});s.select("circle").attr("r",u.defaults.nodeRadius).style("fill",function(w){return w._children?"lightsteelblue":"#fff"});s.select("text").style("fill-opacity",1).style("font-size",v).text(function(w){return w.name});var t=p.exit().transition().duration(q).remove();t.select("circle").attr("r",0.000001);t.select("text").style("fill-opacity",0.000001);o.forEach(function(w){w.x0=w.x;w.y0=w.y})}});var j=Backbone.View.extend({className:"phyloviz",initialize:function(o){var n=this;n.MIN_SCALE=0.05;n.MAX_SCALE=5;n.MAX_DISPLACEMENT=500;n.margins=[10,60,10,80];n.width=$("#PhyloViz").width();n.height=$("#PhyloViz").height();n.radius=n.width;n.data=o.data;$(window).resize(function(){n.width=$("#PhyloViz").width();n.height=$("#PhyloViz").height();n.render()});n.phyloTree=new b(o.config);n.phyloTree.root=n.data;n.zoomFunc=m.behavior.zoom().scaleExtent([n.MIN_SCALE,n.MAX_SCALE]);n.zoomFunc.translate(n.phyloTree.get("translate"));n.zoomFunc.scale(n.phyloTree.get("scaleFactor"));n.navMenu=new c(n);n.settingsMenu=new i({phyloTree:n.phyloTree});n.nodeSelectionView=new e({phyloTree:n.phyloTree});n.search=new k();setTimeout(function(){n.zoomAndPan()},1000)},render:function(){var o=this;$("#PhyloViz").empty();o.mainSVG=m.select("#PhyloViz").append("svg:svg").attr("width",o.width).attr("height",o.height).attr("pointer-events","all").call(o.zoomFunc.on("zoom",function(){o.zoomAndPan()}));o.boundingRect=o.mainSVG.append("svg:rect").attr("class","boundingRect").attr("width",o.width).attr("height",o.height).attr("stroke","black").attr("fill","white");o.vis=o.mainSVG.append("svg:g").attr("class","vis");o.layoutOptions={model:o.phyloTree,width:o.width,height:o.height,vis:o.vis,margins:o.margins};$("#title").text("Phylogenetic Tree from "+o.phyloTree.get("title")+":");var n=new a(o.layoutOptions)},zoomAndPan:function(n){var t,p;if(typeof n!=="undefined"){t=n.zoom;p=n.translate}var w=this,r=w.zoomFunc.scale(),v=w.zoomFunc.translate(),s="",u="";switch(t){case"reset":r=1;v=[0,0];break;case"+":r*=1.1;break;case"-":r*=0.9;break;default:if(typeof t==="number"){r=t}else{if(m.event!==null){r=m.event.scale}}}if(r<w.MIN_SCALE||r>w.MAX_SCALE){return}w.zoomFunc.scale(r);s="translate("+w.margins[3]+","+w.margins[0]+") scale("+r+")";if(m.event!==null){u="translate("+m.event.translate+")"}else{if(typeof p!=="undefined"){var q=p.split(",")[0];var o=p.split(",")[1];if(!isNaN(q)&&!isNaN(o)){v=[v[0]+parseFloat(q),v[1]+parseFloat(o)]}}w.zoomFunc.translate(v);u="translate("+v+")"}w.phyloTree.set("scaleFactor",r);w.phyloTree.set("translate",v);w.vis.attr("transform",u+s)},reloadViz:function(){var n=this,o=$("#phylovizNexSelector :selected").val();$.getJSON(n.phyloTree.get("dataset").url(),{tree_index:o,data_type:"raw_data"},function(p){n.data=p.data;n.config=p;n.render()})}});var c=Backbone.View.extend({initialize:function(o){var n=this;n.phylovizView=o;$("#panelHeaderRightBtns").empty();$("#phyloVizNavBtns").empty();$("#phylovizNexSelector").off();n.initNavBtns();n.initRightHeaderBtns();$("#phylovizNexSelector").off().on("change",function(){n.phylovizView.reloadViz()})},initRightHeaderBtns:function(){var n=this;rightMenu=create_icon_buttons_menu([{icon_class:"gear",title:"PhyloViz Settings",on_click:function(){$("#SettingsMenu").show();n.settingsMenu.updateUI()}},{icon_class:"disk",title:"Save visualization",on_click:function(){var o=$("#phylovizNexSelector option:selected").text();if(o){n.phylovizView.phyloTree.set("title",o)}n.phylovizView.phyloTree.save()}},{icon_class:"chevron-expand",title:"Search / Edit Nodes",on_click:function(){$("#nodeSelectionView").show()}},{icon_class:"information",title:"Phyloviz Help",on_click:function(){window.open("https://wiki.galaxyproject.org/Learn/Visualization/PhylogeneticTree")}}],{tooltip_config:{placement:"bottom"}});$("#panelHeaderRightBtns").append(rightMenu.$el)},initNavBtns:function(){var n=this,o=create_icon_buttons_menu([{icon_class:"zoom-in",title:"Zoom in",on_click:function(){n.phylovizView.zoomAndPan({zoom:"+"})}},{icon_class:"zoom-out",title:"Zoom out",on_click:function(){n.phylovizView.zoomAndPan({zoom:"-"})}},{icon_class:"arrow-circle",title:"Reset Zoom/Pan",on_click:function(){n.phylovizView.zoomAndPan({zoom:"reset"})}}],{tooltip_config:{placement:"bottom"}});$("#phyloVizNavBtns").append(o.$el)}});var i=l.extend({className:"Settings",initialize:function(o){var n=this;n.phyloTree=o.phyloTree;n.el=$("#SettingsMenu");n.inputs={separation:$("#phyloVizTreeSeparation"),leafHeight:$("#phyloVizTreeLeafHeight"),fontSize:$("#phyloVizTreeFontSize")};$("#settingsCloseBtn").off().on("click",function(){n.el.hide()});$("#phylovizResetSettingsBtn").off().on("click",function(){n.resetToDefaults()});$("#phylovizApplySettingsBtn").off().on("click",function(){n.apply()})},apply:function(){var n=this;if(!n.isAcceptableValue(n.inputs.separation,50,2500)||!n.isAcceptableValue(n.inputs.leafHeight,5,30)||!n.isAcceptableValue(n.inputs.fontSize,5,20)){return}$.each(n.inputs,function(o,p){n.phyloTree.set(o,p.val())})},updateUI:function(){var n=this;$.each(n.inputs,function(o,p){p.val(n.phyloTree.get(o))})},resetToDefaults:function(){$(".tooltip").remove();var n=this;$.each(n.phyloTree.defaults,function(o,p){n.phyloTree.set(o,p)});n.updateUI()},render:function(){}});var e=l.extend({className:"Settings",initialize:function(o){var n=this;n.el=$("#nodeSelectionView");n.phyloTree=o.phyloTree;n.UI={enableEdit:$("#phylovizEditNodesCheck"),saveChanges:$("#phylovizNodeSaveChanges"),cancelChanges:$("#phylovizNodeCancelChanges"),name:$("#phyloVizSelectedNodeName"),dist:$("#phyloVizSelectedNodeDist"),annotation:$("#phyloVizSelectedNodeAnnotation")};n.valuesOfConcern={name:null,dist:null,annotation:null};$("#nodeSelCloseBtn").off().on("click",function(){n.el.hide()});n.UI.saveChanges.off().on("click",function(){n.updateNodes()});n.UI.cancelChanges.off().on("click",function(){n.cancelChanges()});(function(p){p.fn.enable=function(q){return p(this).each(function(){if(q){p(this).removeAttr("disabled")}else{p(this).attr("disabled","disabled")}})}})(jQuery);n.UI.enableEdit.off().on("click",function(){n.toggleUI()})},toggleUI:function(){var n=this,o=n.UI.enableEdit.is(":checked");if(!o){n.cancelChanges()}$.each(n.valuesOfConcern,function(p,q){n.UI[p].enable(o)});if(o){n.UI.saveChanges.show();n.UI.cancelChanges.show()}else{n.UI.saveChanges.hide();n.UI.cancelChanges.hide()}},cancelChanges:function(){var n=this,o=n.phyloTree.get("selectedNode");if(o){$.each(n.valuesOfConcern,function(p,q){n.UI[p].val(o[p])})}},updateNodes:function(){var n=this,o=n.phyloTree.get("selectedNode");if(o){if(!n.isAcceptableValue(n.UI.dist,0,1)||n.hasIllegalJsonCharacters(n.UI.name)||n.hasIllegalJsonCharacters(n.UI.annotation)){return}$.each(n.valuesOfConcern,function(p,q){(o[p])=n.UI[p].val()});n.phyloTree.set("nodeAttrChangedTime",new Date())}else{alert("No node selected")}}});var k=l.extend({initialize:function(){var n=this;$("#phyloVizSearchBtn").on("click",function(){var p=$("#phyloVizSearchTerm"),q=$("#phyloVizSearchCondition").val().split("-"),o=q[0],r=q[1];n.hasIllegalJsonCharacters(p);if(o==="dist"){n.isAcceptableValue(p,0,1)}n.searchTree(o,r,p.val())})},searchTree:function(n,p,o){m.selectAll("g.node").classed("searchHighlight",function(r){var q=r[n];if(typeof q!=="undefined"&&q!==null){if(n==="dist"){switch(p){case"greaterEqual":return q>=+o;case"lesserEqual":return q<=+o;default:return}}else{if(n==="name"||n==="annotation"){return q.toLowerCase().indexOf(o.toLowerCase())!==-1}}}})}});return{PhylovizView:j}});