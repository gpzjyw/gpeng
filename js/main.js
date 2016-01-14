//添加初始事件
(function(){
	addEvent($_id("f-low"), "click", function(){
		createMinesMap(9, 9, 10);
	});
	addEvent($_id("f-middle"), "click", function(){
		createMinesMap(16, 16, 40);
	});
	addEvent($_id("f-high"), "click", function(){
		createMinesMap(16, 30, 99);
	});
})();

function createMinesMap(rowLength, columnLength, mineNum){
	//移除table标签下的所有子节点
	var childs = $_id("m-table").childNodes;
	for(var i=childs.length-1;i>=0;i--){
		$_id("m-table").removeChild(childs.item(i));
	}
	//根据rowLength和columnLength增加table标签下的节点
	for(i=0; i<rowLength; i++){
		var tr = document.createElement("tr");
		tr.className = "row"+i;
		for(j=0; j<columnLength; j++){
			var td = document.createElement("td")
			var pElement = document.createElement("p");
			td.className = "column"+j;
			addEvent(pElement, "click", (function(rowLength, columnLength, mineNum, initRow, initColumn, pElement){
				return function(){
					initializeMine(rowLength, columnLength, mineNum, initRow, initColumn);
				};
			})(rowLength, columnLength, mineNum, i, j, pElement));
			td.appendChild(pElement);
			tr.appendChild(td);
		}
		$_id("m-table").appendChild(tr);
	}
	$_id("j-minenum").innerHTML=mineNum;
}

function initializeMine(rowLength, columnLength, mineNum, initRow, initColumn){
	//移除table标签下的所有子节点
	var childs = $_id("m-table").childNodes;
	for(var i=childs.length-1;i>=0;i--){
		$_id("m-table").removeChild(childs.item(i));
	}
	//根据rowLength和columnLength增加table标签下的节点
	for(i=0; i<rowLength; i++){
		var tr = document.createElement("tr");
		tr.className = "row"+i;
		for(j=0; j<columnLength; j++){
			var td = document.createElement("td")
			var pElement = document.createElement("p");
			td.className = "column"+j;
			td.appendChild(pElement);
			tr.appendChild(td);
		}
		$_id("m-table").appendChild(tr);
	}
	$_id("j-minenum").innerHTML=mineNum;
	/* 
	 * mineArray，表示是否有雷，有雷概率为10%；
	 * mineAround，表示方块周围8（或3或5）个方块中有雷方块的数目；
	 * flagMarked，表示是否被标记：初始为0，表示未被标记；为1，表示被标记为雷；为2，表示已经被扫过，即不是雷；
	 * randomMine，根据雷的总数，生成雷的分布；
	 */
	var mineArray = [],
		mineAround = [],
		flagMarked = [];
	var randomMine = function(){
		var randomRow=Math.floor(rowLength*Math.random());
		var randomColumn=Math.floor(columnLength*Math.random());
		if(randomRow>=initRow-1 && randomRow<=initRow+1 && randomColumn>=initColumn-1 && randomColumn<=initColumn-1){
			arguments.callee();
		}else{
			if(mineArray[randomRow][randomColumn]==0){
				mineArray[randomRow][randomColumn]=1;
			}else{
				arguments.callee();
			}
		}
	}
	
	for(var i=0; i<rowLength; i++){
		mineArray.push([]);
		mineAround.push([]);
		flagMarked.push([]);
		for(var j=0; j<columnLength; j++){
			flagMarked[i].push(0);
			mineArray[i].push(0);
		}
	}
	//根据雷的总数生成雷的分布
	for(var i=0; i<mineNum; i++){
		randomMine();
	}
	//确认一个方块周围8（或3或5）个方块雷的数目，并存入mineAround中
	for(var i=0; i<rowLength; i++){
		for(var j=0; j<columnLength; j++){
			var count = 0;
			if((i-1)>=0 && (j-1)>=0){
				if(mineArray[i-1][j-1]){count++;}
			}
			if((i-1)>=0){
				if(mineArray[i-1][j]){count++;}
			}
			if((i-1)>=0 && (j+1)<columnLength){
				if(mineArray[i-1][j+1]){count++;}
			}
			if((j-1)>=0){
				if(mineArray[i][j-1]){count++;}
			}
			if((j+1)<columnLength){
				if(mineArray[i][j+1]){count++;}
			}
			if((i+1)<rowLength && (j-1)>=0){
				if(mineArray[i+1][j-1]){count++;}
			}
			if((i+1)<rowLength){
				if(mineArray[i+1][j]){count++;}
			}
			if((i+1)<rowLength && (j+1)<columnLength){
				if(mineArray[i+1][j+1]){count++;}
			}
			mineAround[i][j] = count;
		}
	}
	
	mainFunction(rowLength, columnLength, mineArray, mineAround, flagMarked);
}
//根据rowLength，columnLength，mineArray，mineAround生成扫雷的主要程序
function mainFunction(rowLength, columnLength, mineArray, mineAround, flagMarked){
	//为有雷的方块添加alert事件，为无雷的方块添加扫雷程序
	for(var i=0; i<rowLength; i++){
		for(var j=0; j<columnLength; j++){
			var row = document.getElementsByClassName("row"+i)[0];
			var column = row.getElementsByClassName("column"+j)[0];
			var p = column.getElementsByTagName("p")[0];
			
			addEvent(p, "mouseup", (function(x, y){
				return function(event){
					switch (event.button){
						//左键触发事件
						case 0:
							if(mineArray[x][y]==1){
								alert("This is a mine, you failed!");
								// restart a new game
							}else{
								sweepMine(x, y);
							}
							break;
						//右键触发事件
						case 2:
							showFlagMarked(x, y);
							break;
						default:
							break;
					}
				}
			})(i, j));
		}
	}
	//扫雷程序，当点击不是雷的方块时，根据方块周围8个方块的mineAround，确定如何继续扫雷
	function sweepMine(i, j){
		if(mineAround[i][j]==0){
			showMineAround(i, j);
			//左上方	↖
			sweepMineAction(i-1, j-1);
			//正上方	↑
			sweepMineAction(i-1, j);
			//右上方	↗
			sweepMineAction(i-1, j+1);
			//正左方	←
			sweepMineAction(i, j-1);
			//正右方	→
			sweepMineAction(i, j+1);
			//左下方	↙
			sweepMineAction(i+1, j-1);
			//正下方	↓
			sweepMineAction(i+1, j);
			//右下方	↘
			sweepMineAction(i+1, j+1);
		}else{
			showMineAround(i, j);
		}
	}
	/* 
	 * 先判断第i行j列的方块是否存在；若存在，则判断是否被扫过或被标记；
	 * 若未被扫过或被标记，则检查其周边8（或5或2）个方块是否有雷；
	 * 若无雷，则递归调用sweepMine；
	 */
	function sweepMineAction(i, j){
		if(i>=0 && i<rowLength && j>=0 && j<columnLength){
			if(flagMarked[i][j]==0){
				showMineAround(i, j);
				if(mineAround[i][j]==0){
					sweepMine(i, j);
				}
			}
		}
	}
	//显示第i行第j列的方块的mineAround
	function showMineAround(i, j){
		var row = document.getElementsByClassName("row"+i)[0];
		var column = row.getElementsByClassName("column"+j)[0];
		var p = column.getElementsByTagName("p")[0];
		
		flagMarked[i][j] = 2;
		p.innerHTML = mineAround[i][j];
		p.className = "j-sweeped";
	}
	//将第i行j列设置为被标记，若已被标记，则取消标记
	function showFlagMarked(i, j){
		var row = document.getElementsByClassName("row"+i)[0];
		var column = row.getElementsByClassName("column"+j)[0];
		var p = column.getElementsByTagName("p")[0];
		
		if(flagMarked[i][j]==0){
			flagMarked[i][j] = 1;
			p.className = "j-flag"
		} else if(flagMarked[i][j]==1){
			flagMarked[i][j] = 0;
			p.className = "";
		}
	}
}
