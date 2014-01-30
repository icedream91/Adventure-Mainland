
unitSize=100;//单元格大小

mapWidth=24;//地图宽度
mapHeight=24;//地图高度

landItemId=0;
waterItemId=1001;

playerActionButtonColor='#3276b1';//蓝色

landColor='#ed9c28';
waterColor='#428bca';
pathColor='#47a447';

map=new Array(mapHeight);
for(var row=0;row<mapHeight;row++){
    map[row]=new Array(mapWidth);
    for(var column=0;column<mapWidth;column++){
        map[row][column]=0;
    }
}
stringMap=
'111111100000001110000000'+
'111111000000000000000000'+
'111110000000000011100000'+
'111100000111000000000000'+
'111000000000000001110000'+
'110000000011000000000100'+
'100000000000100001110000'+
'000001000000001000000000'+
'000111110000000000011100'+
'000011110000000111000000'+
'000001110000000111000000'+
'000001010000000000011000'+
'000000000000000000000000'+
'000011110000001111000000'+
'000000000000000000001100'+
'000011110000000000000000'+
'000000011110000011100000'+
'000000000000000000000000'+
'110000000000000011000000'+
'111000111000000111000000'+
'111100000000000000000000'+
'111110000000111111000000'+
'111111000110000000001100'+
'111111100000001111000000';
i=0
for(var row=0;row<mapHeight;row++){
    for(var column=0;column<mapWidth;column++){
        var integer=parseInt(stringMap[i]);
        if(integer==1){
            map[row][column]=waterItemId;
        }
        i+=1;
    }
}


viewMapWidth=mapWidth+2;
viewMapHeight=mapHeight+2;
viewMap=new Array(viewMapHeight);
for(var row=0;row<viewMapHeight;row++){
    viewMap[row]=new Array(viewMapWidth);
    for(var column=0;column<viewMapWidth;column++){
        viewMap[row][column]=[''];
    }
}

//玩家、队友、敌人的人物列表
players=[];
friends=[];
enemies=[];


operatingPlayer=null;//正在操纵的玩家
lastClickedPlayerID=null;//最后一次点击的玩家人物ID

roundCount=1;//回合数

