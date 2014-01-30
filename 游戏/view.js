
function drawVisibleMap(){
    //设置页面大小
    $('body').css('width',(mapWidth+2)*unitSize+'px').css('height',(mapHeight+2)*unitSize+'px');
    //绘制单元格
    for(var row=0;row<viewMapHeight;row++){
        for(var column=0;column<viewMapWidth;column++){
            if(row==0||row==viewMapHeight-1){//边缘
                var marginDiv=$('<div class="margin-unit"></div>');
                marginDiv.attr('id','margin-unit'+row+'-'+column);
                marginDiv.css('left',column*unitSize+'px').css('top',row*unitSize+'px');
                marginDiv.appendTo('body');
            }else{
                if(column==0||column==viewMapWidth-1){
                    var marginDiv=$('<div class="margin-unit"></div>');
                    marginDiv.attr('id','margin-unit'+row+'-'+column);
                    marginDiv.css('left',column*unitSize+'px').css('top',row*unitSize+'px');
                    marginDiv.appendTo('body');
                }else{
                    var unitDiv=$('<div class="unit"></div>');
                    unitDiv.attr('id','unit'+row+'-'+column);//设置id用于方便变色
                    unitDiv.css('left',column*unitSize+'px').css('top',row*unitSize+'px');
                    if(map[row-1][column-1]==waterItemId){
                        unitDiv.css('background-color',waterColor);//蓝色
                    }else{
                        unitDiv.css('background-color',landColor);//橙色
                    }
                    unitDiv.appendTo('body');
                }
            }
        }
    }

}


function drawPeople(){//绘制人物
    $('div.person').remove();

    for(var i=0;i<players.length;i++){
        var playerPos=players[i].pos;
        var playerDiv=$('<div class="person"></div>');
        playerDiv.attr('id','player'+players[i].id);
        playerDiv.css('left',(playerPos[1]+1)*unitSize+'px').css('top',(playerPos[0]+1)*unitSize+'px');
        if(players[i].activated){
            playerDiv.css('background-image','url('+players[i].avatarURL+')');
        }else{
            playerDiv.css('background-image','url('+players[i].unactivatedAvatarURL+')');
        }
        playerDiv.appendTo('body');
    }
    for(var i=0;i<friends.length;i++){
        var friendPos=friends[i].pos;
        var friendDiv=$('<div class="person"></div>');
        friendDiv.attr('id','friend'+friends[i].id);
        friendDiv.css('left',(friendPos[1]+1)*unitSize+'px').css('top',(friendPos[0]+1)*unitSize+'px');
        if(friends[i].activated){
            friendDiv.css('background-image','url('+friends[i].avatarURL+')');
        }else{
            friendDiv.css('background-image','url('+friends[i].unactivatedAvatarURL+')');
        }
        friendDiv.appendTo('body');
    }
   for(var i=0;i<enemies.length;i++){
        var enemyPos=enemies[i].pos;
        var enemyDiv=$('<div class="person"></div>');
        enemyDiv.attr('id','enemy'+enemies[i].id);
        enemyDiv.css('left',(enemyPos[1]+1)*unitSize+'px').css('top',(enemyPos[0]+1)*unitSize+'px');
        if(enemies[i].activated){
            enemyDiv.css('background-image','url('+enemies[i].avatarURL+')');
        }else{
            enemyDiv.css('background-image','url('+enemies[i].unactivatedAvatarURL+')');
        }
        enemyDiv.appendTo('body');
    }
}


function resetViewMap(){
    for(var row=0;row<viewMapHeight;row++){
        for(var column=0;column<viewMapWidth;column++){
            if(row==0||row==viewMapHeight-1){
                viewMap[row][column]=[''];
            }else{
                if(column==0||column==viewMapWidth-1){
                    viewMap[row][column]==[''];
                }else{
                    var YInMap=row-1;
                    var XInMap=column-1;
                    if(map[YInMap][XInMap]<0){
                        viewMap[row][column]=['ai',map[YInMap][XInMap]];
                    }else if(map[YInMap][XInMap]==landItemId){
                        viewMap[row][column]=[''];
                    }else if(1<=map[YInMap][XInMap]&&map[YInMap][XInMap]<100){
                        viewMap[row][column]=['player',map[YInMap][XInMap]];
                    }else if(100<=map[YInMap][XInMap]&&map[YInMap][XInMap]<1000){
                        viewMap[row][column]=['ai',map[YInMap][XInMap]];
                    }else{//水地
                        viewMap[row][column]=[''];
                    }    
                }
            }
        }
    }
}


function updateAvatar(person){
    var avatarURL;
    if(person.activated){
        avatarURL=person.avatarURL;
    }else{
        avatarURL=person.unactivatedAvatarURL;
    }
    if(person.id<0){
        $('#enemy'+person.id).css('background-image','url('+avatarURL+')');
    }else if(person.id<100){
        $('#player'+person.id).css('background-image','url('+avatarURL+')');
    }else{
        $('#friend'+person.id).css('background-image','url('+avatarURL+')');
    }
}


function cleanComponents(){
    lastClickedPlayerID=null;
    resetViewMap();
    //重置单元格
    for(var row=0;row<mapHeight;row++){
        for(var column=0;column<mapWidth;column++){
            if(map[row][column]==waterItemId){
                $('#unit'+(row+1)+'-'+(column+1)).css('background-color',waterColor);
            }else{
                $('#unit'+(row+1)+'-'+(column+1)).css('background-color',landColor);
            }
        }
    }
    $('div.margin-unit').css('background-color','black');
    $('div.unit,div.margin-unit').css('background-image','').css('z-index','0');
    //去掉人物信息页
    $('div.person-info').remove();
    //去掉透明面板
    $('div.transparent-panel').remove();
    //addListenPanel();不能加。与人物信息页会冲突

}


function drawTransparentPanel(){//绘制透明面板
    var transparentPanel=$('<div class="transparent-panel"></div>');
    transparentPanel.css('width',(mapWidth+2)*unitSize+'px').css('height',(mapHeight+2)*unitSize+'px');

    var transparentPanelCallback=function(){
        if(operatingPlayer!=null && operatingPlayer.hasMoved){
            operatingPlayer.rest();
            updateAvatar(operatingPlayer);
        }

        cleanComponents();
        addListenPanel();
    };
    transparentPanel.click(transparentPanelCallback);
    transparentPanel.appendTo('body');
}


function updateViewMapAndVisibleMapByPlayerMoveMap(moveMap){
    cleanComponents();

    for(var row=0;row<mapHeight;row++){
        for(var column=0;column<mapWidth;column++){
            if(moveMap[row][column]>=0&&moveMap[row][column]!=operatingPlayer.mv){
                viewMap[row+1][column+1][0]='path';
                $('#unit'+(row+1)+'-'+(column+1)).css('background-color',pathColor);
                $('#unit'+(row+1)+'-'+(column+1));
            }
        }
    }
}


function addPlayerActionButtonsToViewMapAndVisibleMap(){//弹出人物行动菜单
    cleanComponents();

    var playerY=operatingPlayer.pos[0];
    var playerX=operatingPlayer.pos[1];
    
    var attackButtonPos=[(playerY-1)+1,playerX+1];
    var itemsButtonPos=[playerY+1,(playerX+1)+1];
    var restButtonPos=[(playerY+1)+1,playerX+1];

    viewMap[attackButtonPos[0]][attackButtonPos[1]][0]='attackButton';
    viewMap[itemsButtonPos[0]][itemsButtonPos[1]][0]='itemsButton';
    viewMap[restButtonPos[0]][restButtonPos[1]][0]='restButton';
    
    //攻击按钮
    var attackButtonUnitDiv;
    if(attackButtonPos[0]>0){
        attackButtonUnitDiv=$('#unit'+attackButtonPos[0]+'-'+attackButtonPos[1]);
    }else{
        attackButtonUnitDiv=$('#margin-unit'+attackButtonPos[0]+'-'+attackButtonPos[1]);
    }
    attackButtonUnitDiv.css('background-color',playerActionButtonColor);
    attackButtonUnitDiv.css('background-image','url(img/attackButton.png)');
    attackButtonUnitDiv.css('z-index','3');
    
    //物品按钮
    var itemButtonUnitDiv;
    if(itemsButtonPos[1]<=mapWidth){
        itemButtonUnitDiv=$('#unit'+itemsButtonPos[0]+'-'+itemsButtonPos[1]);
    }else{
        itemButtonUnitDiv=$('#margin-unit'+itemsButtonPos[0]+'-'+itemsButtonPos[1]);
    }
    itemButtonUnitDiv.css('background-color',playerActionButtonColor);
    itemButtonUnitDiv.css('background-image','url(img/itemsButton.png)');
    itemButtonUnitDiv.css('z-index','3');

    //休息按钮
    var restButtonUnitDiv;
    if(restButtonPos[0]<=mapHeight){
        restButtonUnitDiv=$('#unit'+restButtonPos[0]+'-'+restButtonPos[1]);
    }else{
        restButtonUnitDiv=$('#margin-unit'+restButtonPos[0]+'-'+restButtonPos[1]);
    }
    restButtonUnitDiv.css('background-color',playerActionButtonColor);
    restButtonUnitDiv.css('background-image','url(img/restButton.png)');
    restButtonUnitDiv.css('z-index','3');
}


function moveScreenAccordingToPersonDiv(personDiv){
    var personDivY=personDiv.position().top;
    var personDivX=personDiv.position().left;

    var screenY=window.pageYOffset;
    var screenX=window.pageXOffset;
    //totalCount*everyOffset必须等于unitSize
    var totalCount=20;
    var everyOffset=5;
    if(personDivY-screenY<unitSize){
        var counter1=0;
        var stopMoveScreenFlag1=setInterval(function(){
            window.scrollBy(0,-everyOffset);
            counter1+=1;
            if(counter1==totalCount){
                clearInterval(stopMoveScreenFlag1);
            }
        },20);
    }
    if(screenY+window.innerHeight-(personDivY+unitSize)<unitSize){
        var counter2=0;
        var stopMoveScreenFlag2=setInterval(function(){
            window.scrollBy(0,everyOffset);
            counter2+=1;
            if(counter2==totalCount){
                clearInterval(stopMoveScreenFlag2);
            }
        },20);
    }

    if(personDivX-screenX<unitSize){
        var counter3=0;
        var stopMoveScreenFlag3=setInterval(function(){
            window.scrollBy(-everyOffset,0);
            counter3+=1;
            if(counter3==totalCount){
                clearInterval(stopMoveScreenFlag3);
            }
        },20);
    }
    if(screenX+window.innerWidth-(personDivX+unitSize)<unitSize){
        var counter4=0;
        var stopMoveScreenFlag4=setInterval(function(){
            window.scrollBy(everyOffset,0);
            counter4+=1;
            if(counter4==totalCount){
                clearInterval(stopMoveScreenFlag4);
            }
        },20);
    }
}


function moveVisiblePerson(person,targetY,targetX){//移动人物
    var moveDestinations=person.getMoveDestinations(targetY,targetX);

    //以下设置可视效果
    //移动时不可鼠标操作
    $('div.listen-click-panel').remove();

    cleanComponents();

    var personDivID;
    if(person.id<0){
        personDivID='enemy'+person.id;
    }else if(person.id<100){
        personDivID='player'+person.id;
    }else{
        personDivID='friend'+person.id;
    }


    for(var i=moveDestinations.length-1;i>=0;i--){
        var newY=(moveDestinations[i][0]+1)*unitSize+'px';
        var newX=(moveDestinations[i][1]+1)*unitSize+'px';
        
        var personDiv=$('#'+personDivID);
        if(i>0){//非最后一个目的地
            personDiv.animate({top:newY,left:newX},500,'linear',function(){moveScreenAccordingToPersonDiv(personDiv)});
        }else{//到达最后一个目的地
            if(person.id>0&&person.id<100){//如果是玩家，则移动结束展开行动菜单。
                function playerDivMoveCallback(){
                    moveScreenAccordingToPersonDiv(personDiv);
                    person.hasMoved=true;
                    addPlayerActionButtonsToViewMapAndVisibleMap();
                    addListenPanel();
                }
                personDiv.animate({top:newY,left:newX},500,'linear',playerDivMoveCallback);
            }else{
                function AIDivMoveCallback(){
                    moveScreenAccordingToPersonDiv(personDiv);
                    person.hasMoved=true;
                    addListenPanel();
                }
                personDiv.animate({top:newY,left:newX},500,'linear',AIDivMoveCallback);
            }
        }
    }
}


function showPersonInfo(personID){
    cleanComponents();
    $('div.listen-click-panel').remove();

    drawTransparentPanel();
    //确定选中的人物
    var person;
    if(personID<0){
        for(var i=0;i<enemies.length;i++){
            if(enemies[i].id==personID){
                person=enemies[i];
                break;
            }
        }
    }else if(personID<100){
        for(var i=0;i<players.length;i++){
            if(players[i].id==personID){
                person=players[i];
                break;
            }
        }
    }else{
        for(var i=0;i<friends.length;i++){
            if(friends[i].id==personID){
                person=friends[i];
                break;
            }
        }
    }

    //创建人物信息页
    var personInfoDiv=$('<div class="person-info"></div>');
    personInfoDiv.css('left',($(window).width()-500)/2+window.pageXOffset+'px').css('top',($(window).height()-500)/2+window.pageYOffset+'px');//here resize()

    //往人物信息页添加头像
    var avatarDiv=$('<div class="person-avatar"></div>').css('background-image','url('+person.avatarURL+')');
    avatarDiv.appendTo(personInfoDiv);

    //往人物信息页添加姓名
    var nameDiv=$('<div class="person-name"></div>').text(person.name);
    nameDiv.appendTo(personInfoDiv);

    //往人物信息页添加人物属性
    var attrDiv=$('<div class="person-attr"></div>');
    $('<p>生命值：'+person.hp+'/'+person.maxHp+'</p>').appendTo(attrDiv);
    $('<p>等&nbsp;&nbsp;&nbsp;级：'+person.lv+'</p>').appendTo(attrDiv);
    $('<p>经验值：'+Math.floor(person.ex*100)+'/'+100+'</p>').appendTo(attrDiv);
    $('<p>移动力：'+person.mv+'</p>').appendTo(attrDiv);
    $('<p>攻击力：'+person.totalAp+'</p>').appendTo(attrDiv);
    $('<p>防御力：'+person.totalDp+'</p>').appendTo(attrDiv);
    $('<p>命中率：'+Math.floor(person.hit*100)+'%</p>').appendTo(attrDiv);
    attrDiv.appendTo(personInfoDiv);

    //往人物信息页添加人物装备
    var equipmentsDiv=$('<div class="person-equipments"></div>');
    //添加武器栏
    var itemDiv=$('<div class="equipment-item"></div>');
    var weaponNameDiv=$('<div class="item-name"></div>').text(person.weapon.name);
    var weaponStatementDiv=$('<div class="item-statement"></div>').text(person.weapon.statement);
    weaponNameDiv.appendTo(itemDiv);
    weaponStatementDiv.appendTo(itemDiv);
    itemDiv.appendTo(equipmentsDiv);
    //添加护具栏
    var clothesDiv=$('<div class="equipment-item"></div>');
    var clothesNameDiv=$('<div class="item-name"></div>').text(person.clothes.name);
    var clothesStatementDiv=$('<div class="item-statement"></div>').text(person.clothes.statement);
    clothesDiv.append(clothesNameDiv,clothesStatementDiv);
    clothesDiv.appendTo(equipmentsDiv);

    equipmentsDiv.appendTo(personInfoDiv);

    //往人物信息页添加人物物品栏
    var goodsDiv=$('<div class="person-goods"></div>');
    for(var i=0;i<person.items.length;i++){
        var itemDiv=$('<div class="goods-item"></div>');

        var itemNameDiv=$('<div class="item-name"></div>').text(person.items[i].name);
        var itemStatementDiv=$('<div class="item-statement"></div>').text(person.items[i].statement);

        if(0<person.id&&person.id<100&&person.activated){//确定是在我方可活动的人物上点击而弹出人员信息页
            itemDiv.mouseenter(function(){
                $(this).css('background-color','#3276b1');//蓝色
            });
            itemDiv.mouseleave(function(){
                $(this).css('background-color','rgb(71, 164, 71)');//绿色
            });
            itemDiv.data('index',i);
            itemDiv.click(function(){
                var itemID=$(this).data('index');
                operatingPlayer.use(itemID)
                showUseOrRestPerson(operatingPlayer);
                updateAvatar(operatingPlayer);
                cleanComponents();
                addListenPanel();
            });
        }
        itemNameDiv.appendTo(itemDiv);
        itemStatementDiv.appendTo(itemDiv);

        itemDiv.appendTo(goodsDiv);
    }
    goodsDiv.appendTo(personInfoDiv);
    
    //将人物信息页加入页面中
    personInfoDiv.appendTo('body');
}


function drawCouldAttackPositions(couldAttackPositions){
    cleanComponents();

    for(var i=0;i<couldAttackPositions.length;i++){
        var y=couldAttackPositions[i][0];
        var x=couldAttackPositions[i][1];
        viewMap[y+1][x+1][0]='attack';
        $('#unit'+(y+1)+'-'+(x+1)).css('background-color','#d9534f');//红色
    }
}


function showAttackPerson(person){
    var personDivID;
    if(person.id<0){
        personDivID='#enemy'+person.id;
    }else if(person.id<100){
        personDivID='#player'+person.id;
    }else{
        personDivID='#friend'+person.id;
    }
    function changeRedColor(){
        $(personDivID).css('background-color','#d9534f');//红色
    };
    function restColor(){
        $(personDivID).css('background-color','');//去掉颜色
    };
    
    setTimeout(changeRedColor,0);;
    setTimeout(restColor,400);//0.4秒后去掉颜色
}
    

function showUseOrRestPerson(person){
    var personDivID;
    if(person.id<0){
        personDivID='#enemy'+person.id;
    }else if(person.id<100){
        personDivID='#player'+person.id;
    }else{
        personDivID='#friend'+person.id;
    }
    function changeRedColor(){
        $(personDivID).css('background-color','#5cb85c');//绿色
    };
    function restColor(){
        $(personDivID).css('background-color','');//去掉颜色
    };
    
    setTimeout(changeRedColor,0);;
    setTimeout(restColor,400);//0.4秒后去掉的颜色
}


function listenClick(e){//监控鼠标左键点击
    var posY=Math.floor(e.pageY/100);
    var posX=Math.floor(e.pageX/100);

    switch(viewMap[posY][posX][0]){
        case 'player'://点击玩家
            //确定是哪个人物
            var playerID=viewMap[posY][posX][1];
            var player;
            for(var i=0;i<players.length;i++){
                if(players[i].id==playerID){
                    player=players[i];
                    break;
                }
            }

            if(player.activated){//如果人物是激活的
                if(operatingPlayer==null){
                    operatingPlayer=player;
                }
                if(lastClickedPlayerID!=playerID){//前后两次不是点击同一个玩家人物
                    if(operatingPlayer!=null && operatingPlayer.hasMoved){//让前一个玩家人物已移动，则让其休息
                        operatingPlayer.rest();
                        //updateAvatar(operatingPlayer);
                    }
                    operatingPlayer=player;//操纵新玩家人物，更新operatingPlayer
                    player.calMoveMap();
                    var moveMap=player.moveMap;
                    if(!operatingPlayer.hasMoved){//防止玩家人物移动后再点击玩家人物
                        updateViewMapAndVisibleMapByPlayerMoveMap(moveMap);
                    }else{//玩家人物移动后再点击人物则清除行动按钮等
                        cleanComponents();
                    }
                }else{//前后点击同一个玩家人物
                    addPlayerActionButtonsToViewMapAndVisibleMap();
                }
            }else{//人物不是激活的
                showPersonInfo(player.id);
            }
            lastClickedPlayerID=playerID;
            break;
        case 'path'://点击行走路径
            operatingPlayer.move(posY-1,posX-1);
            moveVisiblePerson(operatingPlayer,posY-1,posX-1);
            break;
        case 'ai'://点击AI
            if(operatingPlayer!=null && operatingPlayer.hasMoved){
                operatingPlayer.rest();
            }

            var personID=map[posY-1][posX-1];
            showPersonInfo(personID);
            break;
        case ''://点击空白单元格
            if(operatingPlayer!=null && operatingPlayer.hasMoved){
                operatingPlayer.rest();
            }
            cleanComponents();
            break;
        case 'attackButton':
            var couldAttackPositions=operatingPlayer.getCouldAttackPositions();
            drawCouldAttackPositions(couldAttackPositions);
            break;
        case 'restButton'://点击休息按钮
            if(!operatingPlayer.hasMoved){
                operatingPlayer.hp+=Math.round(operatingPlayer.maxHp*0.1);
                if(operatingPlayer.hp>operatingPlayer.maxHp){
                    operatingPlayer.hp=operatingPlayer.maxHp;
                }
                showUseOrRestPerson(operatingPlayer);
            }
            operatingPlayer.rest();
            cleanComponents();
            break;
        case 'itemsButton'://点击物品按钮
            showPersonInfo(operatingPlayer.id);
            break;
        case 'attack':
            var enemyID=map[posY-1][posX-1];
            if(enemyID<0){
                for(var i=0;i<enemies.length;i++){
                    if(enemies[i].id==enemyID){
                        operatingPlayer.attack(enemies[i]);
                        cleanComponents();
                        drawPeople();
                        break;
                    }
                }
            }

            break;

            
    }
}


function drawRoundMessage(){
    //添加底层透明面板
    var basePanel=$('<div class="round-message-base-panel"></div>');
    basePanel.css('width',(mapWidth+2)*unitSize+'px').css('height',(mapHeight+2)*unitSize+'px');
    basePanel.appendTo('body');

    var messageDiv=$('<div class="round-message"></div>');
    messageDiv.css('left',($(window).width()-600)/2+window.pageXOffset+'px').css('top',($(window).height()-300)/2+window.pageYOffset+'px');//here resize()
    messageDiv.text('第'+roundCount+'回合');

    messageDiv.appendTo('body');

    var fadeInCallback=function(){//fadeIn的回调函数

        var fadeOutCallback=function(){//fadeOut的回调函数
            $('div.round-message-base-panel').remove();
            $('div.round-message').remove();
            addListenPanel();//开始监听玩家鼠标操作
        }

        $('div.round-message').fadeOut(500,fadeOutCallback);
    }

    $('div.round-message').fadeIn(1200,fadeInCallback);

}


function listenMouseMove(e){
    var x=Math.floor(e.pageX/unitSize)-1;
    var y=Math.floor(e.pageY/unitSize)-1;
    
    if(y>=0 && y<mapHeight && x>=0 && x<mapWidth){
        var personId=map[y][x];
        if(personId==0||personId>=1000){
            $('div.hp-info').remove();
            return;
        }

        var people;
        if(personId<0){
            people=enemies;
        }else if(personId<100){
            people=players;
        }else{
            people=friends;
        }

        for(var i=0;i<people.length;i++){
            if(people[i].id==personId){
                $('div.hp-info').remove();//防止鼠标在相邻两个人物移动时产生多个生命值提示

                var hpInfoDiv=$('<div class="hp-info"></div>');
                hpInfoDiv.css('left',($(window).width()-200)/2+window.pageXOffset+'px').css('top',window.pageYOffset+'px');//here resize()
                var hpInfo='<p>'+people[i].name+'</p>';
                hpInfo+='<p>生命值：'+people[i].hp+'/'+people[i].maxHp+'</p>';
                hpInfoDiv.html(hpInfo);
                hpInfoDiv.appendTo('body');
                return;
            }
        }
    }else{
        $('div.hp-info').remove();
    }
}


function scrollToPersonAndAct(person){
    var personY=person.pos[0];
    var personX=person.pos[1];
    //可视人物现在的位置
    var currentVisiblePersonY=(personY+1)*unitSize;
    var currentVisiblePersonX=(personX+1)*unitSize;
    //目标位置
    var targetScreenY=currentVisiblePersonY-window.innerHeight/2;
    var targetScreenX=currentVisiblePersonX-window.innerWidth/2;
    //当前位置和目标位置的距离
    var offsetY=targetScreenY-window.pageYOffset;
    var offsetX=targetScreenX-window.pageXOffset;
    //确定每次移动的距离
    var everyOffsetY;
    if(offsetY>=0){
        everyOffsetY=10;
    }else{
        everyOffsetY=-10;
    }
    var everyOffsetX;
    if(offsetX>=0){
        everyOffsetX=10;
    }else{
        everyOffsetX=-10;
    }
    //确定要移动的次数
    var scrollYTotalTimes=offsetY/everyOffsetY;
    var scrollXTotalTimes=offsetX/everyOffsetX;
    //移动的次数计数器
    var scrollYCount=0;
    var scrollXCount=0;
    
    var scrollX=function(){
        if(scrollXCount<scrollXTotalTimes){
            scrollBy(everyOffsetX,0);
            scrollXCount+=1;
        }else{
            clearInterval(stopScrollX);
            if(person.id<0||person.id>=100){//确定是AI
                person.act();
            }else{//id属于玩家人物，代表AI行动完毕，是新回合
                //新回合
                roundCount+=1;
                drawRoundMessage();
            }

        }
    }

    var scrollY=function(){
        if(scrollYCount<scrollYTotalTimes){
            scrollBy(0,everyOffsetY);
            scrollYCount+=1;
        }else{
            clearInterval(stopScrollY);
            stopScrollX=setInterval(scrollX,10);
        }
    }
    stopScrollY=setInterval(scrollY,10);

}


function addListenPanel(){
    var listenClickPanel=$('<div class="listen-click-panel"></div>');
    listenClickPanel.css('width',(mapWidth+2)*unitSize+'px').css('height',(mapHeight+2)*unitSize+'px');
    listenClickPanel.click(listenClick);
    listenClickPanel.mousemove(listenMouseMove);
    listenClickPanel.appendTo('body');
}


drawVisibleMap();
drawPeople();
resetViewMap();
drawRoundMessage();


