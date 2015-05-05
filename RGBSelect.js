/**
 * Deprecated class. try to use ajax method select_rgb which uses ColorSelectPalet.
 * 
 */
var RGBSelect=new Class({
	Implements:Events,
	initialize:function(element, options){
		var me=this;
		me.element=element;
		me.options=Object.append({
			gridClassPrefix:"colorGrid",
			state:'#FFFFFF',
			tiles:[ [[false,false,[1,1,0],false,false],
			         [false,false,[0,0,0],false,false]],
				  
			       [[[0,1,0], [1,1,0], [1,0,0], [0,0,0]],
				    [[1,1,1], [1,0,1], [0,0,1], [0,1,1]]],
				  
				   [[false,false,[1,0,1],false,false],
				    [false,false,[0,1,1],false,false]]
					]
			
			
			
		},options);
		
		me.state=me.options.state||'#FFFFFF';
		me.table=me.makeTable(me.createDomTiles(me.options.tiles, me.options));
		me.element.appendChild(me.table);
	
	},
	getContainer:function(){
		return this.table;
	},
	getState:function(){
		return this.state;
		
	},
	getValue:function(){
		return this.getState();
		
	},
	makeTable:function(tiles, callback){
		var me=this;
		var table=new Element('table');
		var tbody=new Element('tbody');
		table.appendChild(tbody);
		Object.each(tiles, function(row, r){
			var tr=new Element('tr');
			tbody.appendChild(tr);
			Object.each(row, function(data, c){
				var td=new Element('td');
				tr.appendChild(td);
				if(callback){
					callback(td, data, r, c);
				}else{
					if(data){ 
						td.appendChild(data);
						}
				}
			});
		});
		table.addClass(me.options.gridClassPrefix+"Container");
		return table;
		
	},
	_parseColor:function(c){
		//TODO: ensure color is a proper rgb value. or convert if possible.
		//or return false.
		return c;
	},
	_setState:function(color,suppressEvents){
		var me=this;
		var formatted=_parseColor(color);
		if(formatted&&me.state!=formatted){
			me.state=formatted;
			me.fireEvent('onChange',formatted);
		}
	},
	setValue:function(color){
		var me=this;
		me._setState(color);
	},
	createDomTiles:function(tiles,options){
		var me=this;
		var j=0; var i=0;
		var domTiles=[];
		
		me.colorMap={};
		
		var activeGrid=false;
		var activate=function(color, grid, suppressEvents){
			//console.debug(["Activate",{color:color}]);
			me.state=color;
			if(grid.hasClass('active')){
				if(color&&!suppressEvents){
					me.fireEvent('onChange',color);
					}
			}else{
				if(activeGrid.hasClass('active')){
					activeGrid.removeClass('active');
				}
				activeGrid=grid;
				grid.addClass('active');
				if(color&&!suppressEvents){
					me.fireEvent('onChange',color);
					}
			}
				
		};
		var selectedColorDiv=null;
		var select=function(colorDiv){
			if(selectedColorDiv){
				selectedColorDiv.removeClass('selected');
			}
			selectedColorDiv=colorDiv;
			colorDiv.addClass('selected');
			
			
		};
		
		
		for(j=0;j<tiles.length;j++){
			domTiles[j]=[];
			for(i=0;i<tiles[j][0].length;i++){
			
				var data=me.createGrid([tiles[j][0][i], tiles[j][1][i]],options);
				if(data){
					var shrinkWrap=function(e){
						e.setStyle('border',0);
						e.setStyle('margin',0);
						e.setStyle('padding',0);
					};

						
						
					
					var gridContainer=new Element('div');
					gridContainer.addClass(options.gridClassPrefix);
					gridContainer.setStyle('textAlign','center');
					var gridTable=new Element('table');
					gridTable.setStyle('borderCollapse','collapse');
					gridTable.setStyle('display','inline-block');
					var gridTbody=new Element('tbody');
					gridContainer.appendChild(gridTable);
					
					if(j==1&&i==2){
						gridContainer.addClass("active");
						gridContainer.addClass("center");
						activeGrid=gridContainer;
					}
					if(j==0&&i==2){
						gridContainer.addClass("top");
					}
					if(j==2&&i==2){
						gridContainer.addClass("bottom");
					}
					if(j==1&&i==4){
						gridContainer.addClass("right");
					}
					if(j==1&&i==0){
						gridContainer.addClass("left");
					}
					gridContainer.addClass("cg_"+j+"_"+i);
					
					gridTable.appendChild(gridTbody);
					domTiles[j][i]=gridContainer;
					
					Object.each(data,function(rows,r){
						var gridRow=new Element('tr');
						shrinkWrap(gridRow);
						gridTbody.appendChild(gridRow);
						Object.each(rows, function(cell){
							var gridData=new Element('td');
							shrinkWrap(gridData);
							var gridColor=new Element('div');
							gridRow.appendChild(gridData);
							gridData.appendChild(gridColor);
							var rgb=('rgb('+(cell[0])+','+(cell[1])+','+(cell[2])+')').rgbToHex();
							gridColor.setStyle('backgroundColor',rgb);	
							//gridColor.setStyle('width','10px');
							//gridColor.setStyle('height','10px');
							gridColor.addClass('color');
							
							if(cell[0]+cell[1]+cell[2]<140){
								gridColor.addClass('dark');
							}
							var currentGrid=gridContainer;
							gridColor.addEvent('click',function(e){
								e.stop();
								select(gridColor);
								activate(rgb,currentGrid);
							});
							
							if(this.state==rgb||'#'+this.state==rgb||this.state=='#'+rgb){
								select(gridColor);
								activate(rgb,currentGrid);
								
							}
							
							me.colorMap[rgb]=[rgb, gridColor, currentGrid];
							
							//console.debug(["Square",{rgb:rgb, hex:rgb.rgbToHex()}]);

							
						});
						
					});
					//console.debug(["",{grid:data}]);

				}else{
					domTiles[j][i]=false;
					
				}
				
				
			}	
			
			//console.debug(['Creating Dom Color Row',{row:j, cells:i}]);
		}
		return domTiles;
		
	},
	createGrid:function(points, options){
		var config=Object.merge({},{rows:8, columns:8},options);
		var grid=[];
		var start=points[0];
		if(start==false)return false;
		var end=points[1];
		var direction=[end[0]-start[0],end[1]-start[1],end[2]-start[2]];
		if(start.length==5){
			var x=start[3];  var y=start[4];
		}else{
			x=direction[0]==0?1:0;
			y=direction[2]==0?1:2;					
		}
		
		var r=0;
		var c=0;

		var flat=x==1?0:(y==1?2:1);
		var runit=255.0/config.rows;
		var cunit=255.0/config.columns;
		for(r=0;r<config.rows;r++){
			grid[r]=[];
			var yval=r*runit;
			yval=(direction[y]>0)?yval:(255-yval);
			
			for(c=0;c<config.columns;c++){
				var xval=c*cunit;
				xval=(direction[x]>0)?xval:(255-xval);
				
				var result=[0,0,0];
				result[x]=Math.round(xval);
				result[y]=Math.round(yval);
				result[flat]=Math.round((255)*start[flat]);
				grid[r][c]=result;	
			}	
		}
		//console.debug(["Created RGB Array",{grid:grid, start:start, end:end, rows:config.rows, columns:config.columns}]);
		return grid;
		
	}
	
	
});