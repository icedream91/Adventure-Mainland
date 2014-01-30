
function setPeople(){
    var shortsword=new ShortSword();
    var bow=new Bow();
    var ironFist=new IronFist();
    var spear=new Spear();

    var cloth=new Cloth();
    var armor=new Armor();

    var herb=new Herb();

    //(id,name,avatarName,lv,maxHp,mv,ex,ap,dp,hit,weapon,clothes,items,pos)
    var p1=new Player(1,'罗辑','1.png',1,42,4,0,6,4,0.8,shortsword,cloth,[herb,herb],[6,6]);
    players.push(p1);

    var p2=new Player(2,'安琪','2.png',1,30,4,0,5,3,0.8,bow,cloth,[herb],[6,8]);
    players.push(p2);

     var p3=new Player(3,'云天明','3.png',1,50,4,0,7,6,0.8,ironFist,armor,[herb],[7,7]);
    players.push(p3);

    var p4=new Player(4,'伊文斯','4.png',1,48,7,0,6,4,0.8,spear,cloth,[herb],[7,8]);
    players.push(p4);


    var e1=new AI(-1,'山贼','-1.png',1,28,4,0,14,2,0.8,shortsword,cloth,[],[6,1],false);
    enemies.push(e1);

    var e2=new AI(-2,'山贼','-1.png',1,28,4,0,14,2,0.8,shortsword,cloth,[],[8,2],false);
    enemies.push(e2);

    var e3=new AI(-3,'山贼','-1.png',1,28,4,0,14,2,0.8,shortsword,cloth,[],[8,1],false);
    enemies.push(e3);

    var e4=new AI(-4,'山贼','-1.png',1,28,4,0,14,2,0.8,shortsword,cloth,[],[9,1],false);
    enemies.push(e4);

    var e5=new AI(-5,'山贼','-1.png',1,28,4,0,14,2,0.8,shortsword,cloth,[],[20,5],false);
    enemies.push(e5);

    var e6=new AI(-6,'山贼','-1.png',1,28,4,0,14,2,0.8,shortsword,cloth,[],[20,6],false);
    enemies.push(e6);

    var e7=new AI(-7,'山贼','-1.png',1,28,4,0,14,2,0.8,shortsword,cloth,[],[21,5],false);
    enemies.push(e7);

    var e8=new AI(-8,'山贼头目','-2.png',3,72,4,0,20,6,0.8,shortsword,cloth,[],[21,6],false);
    enemies.push(e8);

}


function addPeopleToMap(){
    for(var i=0;i<players.length;i++){
        var pos=players[i].pos;
        map[pos[0]][pos[1]]=players[i].id;
    }
    for(var i=0;i<friends.length;i++){
        var pos=friends[i].pos;
        map[pos[0]][pos[1]]=friends[i].id;
    }
    for(var i=0;i<enemies.length;i++){
        var pos=enemies[i].pos;
        map[pos[0]][pos[1]]=enemies[i].id;
    }
}


function nextAIMove(){

    for(var i=0;i<friends.length;i++){
        if(friends[i].activated){
            scrollToPersonAndAct(friends[i]);
            return;
        }
    }
    for(var i=0;i<enemies.length;i++){
        if(enemies[i].activated){
            scrollToPersonAndAct(enemies[i]);
            return;
        }
    }
}


function checkGameState(){
    if(players.length==0){
        alert('你输了');
    }else if(enemies.length==0){
        alert('你赢了');
    }
}


function callNextPersonToMove(){
    var activatedPlayerCount=0;
    for(var i=0;i<players.length;i++){
        if(players[i].activated){
            activatedPlayerCount+=1;
        }
    }
    var activatedAICount=0;
    for(var i=0;i<friends.length;i++){
        if(friends[i].activated){
            activatedAICount+=1;
        }
    }
    for(var i=0;i<enemies.length;i++){
        if(enemies[i].activated){
            activatedAICount+=1;
        }
    }

    if(activatedPlayerCount==0 && activatedAICount!=0){
        nextAIMove();
    }else if(activatedPlayerCount==0 && activatedAICount==0){
        //重新激活全部人物
        for(var i=0;i<players.length;i++){
            players[i].hasMoved=false;
            players[i].activated=true;
            $('#player'+players[i].id).css('background-image','url('+players[i].avatarURL+')');
        }
        for(var i=0;i<friends.length;i++){
            friends[i].hasMoved=false;
            friends[i].activated=true;
            $('#friend'+friends[i].id).css('background-image','url('+friends[i].avatarURL+')');
        }
        for(var i=0;i<enemies.length;i++){
            enemies[i].hasMoved=false;
            enemies[i].activated=true;
            $('#enemy'+enemies[i].id).css('background-image','url('+enemies[i].avatarURL+')');
        }

        scrollToPersonAndAct(players[0]);
    }

}


setPeople();
addPeopleToMap();


