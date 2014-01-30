function Player(id,name,avatarName,lv,maxHp,mv,ex,ap,dp,hit,weapon,clothes,items,pos){
    this.id=id;
    this.name=name;
    this.lv=lv;
    this.maxHp=maxHp;
    this.hp=this.maxHp;
    this.mv=mv;
    this.ex=ex;
    this.ap=ap;
    this.dp=dp;
    this.hit=hit;
    this.weapon=weapon;
    this.clothes=clothes;
    this.items=items;
    this.pos=pos;

    this.avatarURL='img/'+avatarName;
    this.unactivatedAvatarURL='img/grey'+avatarName;
    this.totalAp=this.ap+this.weapon.ap;
    this.totalDp=this.dp+this.clothes.dp;
    this.activated=true;
    this.hasMoved=false;

    this.friendly=true;
    
    this.calMoveMap=function(){
        //初始化moveMap
        this.moveMap=new Array(mapHeight);
        for(var row=0;row<mapHeight;row++){
            this.moveMap[row]=new Array(mapWidth);
            for(var column=0;column<mapWidth;column++){
                this.moveMap[row][column]=-1;
            }
        }
        this._calCouldMovePositions=function(remainedMv,y,x){
            remainedMv-=1;
            if(remainedMv<0){
                return;
            }
            if(y-1>=0 && this.moveMap[y-1][x]<remainedMv && 0<=map[y-1][x] && map[y-1][x]<1000){
                this.moveMap[y-1][x]=remainedMv;
                this._calCouldMovePositions(remainedMv,y-1,x);
            }
            if(y+1<mapHeight && this.moveMap[y+1][x]<remainedMv && 0<=map[y+1][x] && map[y+1][x]<1000){
                this.moveMap[y+1][x]=remainedMv;
                this._calCouldMovePositions(remainedMv,y+1,x);
            }
            if(x-1>=0 && this.moveMap[y][x-1]<remainedMv && 0<=map[y][x-1] && map[y][x-1]<1000){
                this.moveMap[y][x-1]=remainedMv;
                this._calCouldMovePositions(remainedMv,y,x-1);
            }
            if(x+1<mapWidth && this.moveMap[y][x+1]<remainedMv && 0<=map[y][x+1] && map[y][x+1]<1000){
                this.moveMap[y][x+1]=remainedMv;
                this._calCouldMovePositions(remainedMv,y,x+1);
            }

        }

        this.moveMap[this.pos[0]][this.pos[1]]=this.mv;
        this._calCouldMovePositions(this.mv,this.pos[0],this.pos[1]);

        this.visiblePathMap=new Array(mapHeight);//该地图专门用于移动可视的人物
        for(var row=0;row<mapHeight;row++){
            this.visiblePathMap[row]=new Array(mapWidth);
            for(var column=0;column<mapWidth;column++){
                this.visiblePathMap[row][column]=this.moveMap[row][column];
            }
        }

        //设置已有人的地方不可停留
        for(var i=0;i<players.length;i++){
            var pos=players[i].pos;
            this.moveMap[pos[0]][pos[1]]=-1;
        }
        this.moveMap[this.pos[0]][this.pos[1]]=this.mv;
        for(var i=0;i<friends.length;i++){
            var pos=friends[i].pos;
            this.moveMap[pos[0]][pos[1]]=-1;
        }
        for(var i=0;i<enemies.length;i++){
            var pos=enemies[i].pos;
            this.moveMap[pos[0]][pos[1]]=-1;
        }

    };

    this.move=function(targetY,targetX){
        //设置新的map和人物的位置参数
        map[this.pos[0]][this.pos[1]]=0;
        map[targetY][targetX]=this.id;
        this.pos=[targetY,targetX];
    };

    this.getMoveDestinations=function(targetY,targetX){
        this.moveDestinations=[];
        while(true){
            var remainedMv=this.visiblePathMap[targetY][targetX];
            if(remainedMv==this.mv){
                break;
            }
            this.moveDestinations.push([targetY,targetX]);

            if(targetY-1>=0 && this.visiblePathMap[targetY-1][targetX]==remainedMv+1){
                targetY-=1;
            }else if(targetY+1<mapHeight && this.visiblePathMap[targetY+1][targetX]==remainedMv+1){
                targetY+=1;
            }else if(targetX-1>=0 && this.visiblePathMap[targetY][targetX-1]==remainedMv+1){
                targetX-=1;
            }else{
                targetX+=1;
            }
        }
        return this.moveDestinations;
    };

    this.getCouldAttackPositions=function(){
        var couldAttackPositions=[];
        
        var width=1;
        var startX=this.pos[1];
        var y=this.pos[0]-this.weapon.attackDistance;
        while(y<=this.pos[0]){
            if(y<0){
                y+=1;
                startX-=1;
                width+=2;
                continue;
            }
            for(var x=startX;x<startX+width;x++){
                if(x<0){
                    continue;
                }
                if(x>=mapWidth){
                    break;
                }

                if(!(y==this.pos[0] && x==this.pos[1])){
                    couldAttackPositions.push([y,x]);
                }
            }
            y+=1;
            startX-=1;
            width+=2;
        }
        //获取角色以南可攻击的位置
        y=this.pos[0]+1;
        width-=4;
        startX+=2;
        while(width>0){
            if(y>=mapHeight){
                break;
            }
            for(var x=startX;x<startX+width;x++){
                if(x<0){
                    continue;
                }
                if(x>=mapWidth){
                    break;
                }
                couldAttackPositions.push([y,x]);
            }

            y+=1;
            width-=2;
            startX+=1;
        }

        return couldAttackPositions;
    };

    this.rest=function(){//Player
        this.activated=false;
        updateAvatar(this);
        setTimeout(callNextPersonToMove,0);
    };

    this.die=function(){
        //从players列表中删去该人物
        for(var i=0;i<players.length;i++){
            if(players[i].id==this.id){
                players.splice(i,1);
                break;
            }
        }
        //从map中删去该人物
        map[this.pos[0]][this.pos[1]]=0;
        viewMap[this.pos[0]+1][this.pos[1]+1][0]='';
        $('#player'+this.id).remove();

        checkGameState();
    };

    this.upgrade=function(ex){
        this.ex+=ex;
        if(this.ex>=1){
            this.ex-=1;
            this.lv+=1;
            this.maxHp=Math.round(this.maxHp*1.1);
            this.ap*=1.1;
            this.totalAp=Math.round(this.ap)+this.weapon.ap;
            this.dp*=1.1;
            this.totalDp=Math.round(this.dp)+this.clothes.dp;
            this.hit*=1.01;
            if(this.hit>=1){
                this.hit=1;
            }
        }
    };

    this.attack=function(person){
        //攻击
        if(Math.random()<this.hit){
            var damage=this.totalAp-person.totalDp;
            if(damage>0){
                person.hp-=damage;
                showAttackPerson(person);
                this.upgrade(damage/person.maxHp);
                if(person.hp<=0){
                    person.die();
                    this.rest();
                    return;
                }
            }
        }
        this.rest();
        //回击
        if(Math.random()<person.hit){
            var distance=Math.abs(this.pos[0]-person.pos[0])+Math.abs(this.pos[1]-person.pos[1]);
            if(distance==1){
                var damage=person.totalAp-this.totalDp;
                if(damage>0){
                    this.hp-=damage;
                    showAttackPerson(this);
                    person.upgrade(damage/this.maxHp);
                    if(this.hp<=0){
                        this.die();
                    }
                }
            }
        }

    };

    this.use=function(itemID){
        var item=this.items[itemID];
        if(item.function=='+hp'){
            this.hp+=item.hp;
            if(this.hp>this.maxHp){
                this.hp=this.maxHp;
            }
        }
        showUseOrRestPerson(this);
        this.items.splice(itemID,1);
        this.rest();
    };

}


function AI(id,name,avatarName,lv,maxHp,mv,ex,ap,dp,hit,weapon,clothes,items,pos,friendly){
    this.id=id;
    this.name=name;
    this.lv=lv;
    this.maxHp=maxHp;
    this.hp=this.maxHp;
    this.mv=mv;
    this.ex=ex;
    this.ap=ap;
    this.dp=dp;
    this.hit=hit;
    this.weapon=weapon;
    this.clothes=clothes;
    this.items=items;
    this.pos=pos;

    this.avatarURL='img/'+avatarName;
    this.unactivatedAvatarURL='img/grey'+avatarName;
    this.totalAp=this.ap+this.weapon.ap;
    this.totalDp=this.dp+this.clothes.dp
    this.activated=true;
    this.hasMoved=false;

    this.friendly=friendly;
    
    this.calMoveMap=function(){
        //初始化moveMap
        this.moveMap=new Array(mapHeight);
        for(var row=0;row<mapHeight;row++){
            this.moveMap[row]=new Array(mapWidth);
            for(var column=0;column<mapWidth;column++){
                this.moveMap[row][column]=-1;
            }
        }
        this._calCouldMovePositions=function(remainedMv,y,x){
            remainedMv-=1;
            if(remainedMv<0){
                return;
            }
            if(y-1>=0 && this.moveMap[y-1][x]<remainedMv && 
                    (map[y-1][x]==0||(map[y-1][x]<1000 && map[y-1][x]*this.id>0))){
                this.moveMap[y-1][x]=remainedMv;
                this._calCouldMovePositions(remainedMv,y-1,x);
            }
            if(y+1<mapHeight && this.moveMap[y+1][x]<remainedMv && 
                    (map[y+1][x]==0||(map[y+1][x]<1000 && map[y+1][x]*this.id>0))){
                this.moveMap[y+1][x]=remainedMv;
                this._calCouldMovePositions(remainedMv,y+1,x);
            }
            if(x-1>=0 && this.moveMap[y][x-1]<remainedMv && 
                    (map[y][x-1]==0||(map[y][x-1]<1000 && map[y][x-1]*this.id>0))){
                this.moveMap[y][x-1]=remainedMv;
                this._calCouldMovePositions(remainedMv,y,x-1);
            }
            if(x+1<mapWidth && this.moveMap[y][x+1]<remainedMv && 
                    (map[y][x+1]==0||(map[y][x+1]<1000 && map[y][x+1]*this.id>0))){
                this.moveMap[y][x+1]=remainedMv;
                this._calCouldMovePositions(remainedMv,y,x+1);
            }
        }

        this.moveMap[this.pos[0]][this.pos[1]]=this.mv;
        this._calCouldMovePositions(this.mv,this.pos[0],this.pos[1]);
        
        this.visiblePathMap=new Array(mapHeight);//该地图专门用于移动可视的人物
        for(var row=0;row<mapHeight;row++){
            this.visiblePathMap[row]=new Array(mapWidth);
            for(var column=0;column<mapWidth;column++){
                this.visiblePathMap[row][column]=this.moveMap[row][column];
            }
        }

        //设置已有人的地方不可停留
        for(var i=0;i<players.length;i++){
            var pos=players[i].pos;
            this.moveMap[pos[0]][pos[1]]=-1;
        }
        this.moveMap[this.pos[0]][this.pos[1]]=this.mv;
        for(var i=0;i<friends.length;i++){
            var pos=friends[i].pos;
            this.moveMap[pos[0]][pos[1]]=-1;
        }
        for(var i=0;i<enemies.length;i++){
            var pos=enemies[i].pos;
            this.moveMap[pos[0]][pos[1]]=-1;
        }

    };

    this.getMoveDestinations=function(targetY,targetX){
        this.moveDestinations=[];
        while(true){
            var remainedMv=this.visiblePathMap[targetY][targetX];
            if(remainedMv==this.mv){
                break;
            }
            this.moveDestinations.push([targetY,targetX]);

            if(targetY-1>=0 && this.visiblePathMap[targetY-1][targetX]==remainedMv+1){
                targetY-=1;
            }else if(targetY+1<mapHeight && this.visiblePathMap[targetY+1][targetX]==remainedMv+1){
                targetY+=1;
            }else if(targetX-1>=0 && this.visiblePathMap[targetY][targetX-1]==remainedMv+1){
                targetX-=1;
            }else{
                targetX+=1;
            }
        }
        return this.moveDestinations;
    };

    this.rest=function(){//AI
        this.activated=false;
        updateAvatar(this);
        setTimeout(callNextPersonToMove,0);

    };

    this.die=function(){
        var people;
        if(this.id<0){
            people=enemies;
        }else{
            people=friends;
        }
        //从friends或enemies列表中删去该人物
        for(var i=0;i<people.length;i++){
            if(people[i].id==this.id){
                people.splice(i,1);
                break;
            }
        }
        //从map中删去该人物
        map[this.pos[0]][this.pos[1]]=0;
        viewMap[this.pos[0]+1][this.pos[1]+1][0]='';

        if(this.id<0){
            $('#enemy'+this.id).remove();
        }else{
            $('#friend'+this.id).remove();
        }

        checkGameState();
    };

    this.upgrade=function(ex){
        this.ex+=ex;
        if(this.ex>=1){
            this.ex-=1;
            this.lv+=1;
            this.maxHp=Math.round(this.maxHp*1.1);
            this.ap*=1.1;
            this.totalAp=Math.round(this.ap)+this.weapon.ap;
            this.dp*=1.1;
            this.totalDp=Math.round(this.dp)+this.clothes.dp;
            this.hit*=1.01;
            if(this.hit>=1){
                this.hit=1;
            }
        }
    };

    this.attack=function(person){
        //攻击
        if(Math.random()<this.hit){
            var damage=this.totalAp-person.totalDp;
            if(damage>0){
                person.hp-=damage;
                showAttackPerson(person);
                this.upgrade(damage/person.maxHp);
                if(person.hp<=0){
                    person.die();
                    this.rest();
                    return;
                }
            }
        }
        this.rest();
        //回击
        if(Math.random()<person.hit){
            var distance=Math.abs(this.pos[0]-person.pos[0])+Math.abs(this.pos[1]-person.pos[1]);
            if(distance==1){
                var damage=person.totalAp-this.totalDp;
                if(damage>0){
                    this.hp-=damage;
                    showAttackPerson(this);
                    person.upgrade(damage/this.maxHp);
                    if(this.hp<=0){
                        this.die();
                    }
                }
            }
        }

    };

    this.use=function(itemID){
        var item=this.items[itemID];
        if(item.function=='+hp'){
            this.hp+=item.hp;
            if(this.hp>this.maxHp){
                this.hp=this.maxHp;
            }
        }
        showUseOrRestPerson(this);
        this.items.splice(itemID,1);
    };
    
    this.getTargetPos=function(){
        //创建设置targetMap的方法
        this.setTargetMap=function(){
            //创建targetMap
            this.targetMap=new Array(mapHeight);
            for(var row=0;row<mapHeight;row++){
                this.targetMap[row]=new Array(mapWidth);
                for(var column=0;column<mapWidth;column++){
                    this.targetMap[row][column]=Infinity;
                }
            }

            //创建计算targetMap的方法
            this.calTargetMap=function(y,x){
                var distance=this.targetMap[y][x];
                distance+=1;
                if(y-1>=0 && this.targetMap[y-1][x]>distance){
                    this.targetMap[y-1][x]=distance;
                    this.calTargetMap(y-1,x);
                }
                if(y+1<mapHeight && this.targetMap[y+1][x]>distance){
                    this.targetMap[y+1][x]=distance;
                    this.calTargetMap(y+1,x);
                }
                if(x-1>=0 && this.targetMap[y][x-1]>distance){
                    this.targetMap[y][x-1]=distance;
                    this.calTargetMap(y,x-1);
                }
                if(x+1<mapWidth && this.targetMap[y][x+1]>distance){
                    this.targetMap[y][x+1]=distance;
                    this.calTargetMap(y,x+1);
                }
            };

            //调用this.calTargetMap方法
            if(this.id<0){
                for(var i=0;i<players.length;i++){
                    var pos=players[i].pos;
                    this.targetMap[pos[0]][pos[1]]=0;
                    this.calTargetMap(pos[0],pos[1]);
                }
                for(var i=0;i<friends.length;i++){
                    var pos=friends[i].pos;
                    this.targetMap[pos[0]][pos[1]]=0;
                    this.calTargetMap(pos[0],pos[1]);
                }
            }else{
                for(var i=0;i<enemies.length;i++){
                    var pos=enemies[i].pos;
                    this.targetMap[pos[0]][pos[1]]=0;
                    this.calTargetMap(pos[0],pos[1]);
                }
            }

        };//this.setTargetMap函数结束
        
        this.setTargetMap();//设置targetMap
        this.calMoveMap();//计算可到达的目的地地图
        //可以攻击的最远的位置
        var farthestCouldAttackPosY;
        var farthestCouldAttackPosX;
        var farthestCouldAttackDistance=-Infinity;
        //不可以攻击的最近的位置
        var nearestCannotAttackPosY;
        var nearestCannotAttackPosX;
        var nearestCannotAttackDistance=Infinity;

        for(var row=0;row<mapHeight;row++){
            for(var column=0;column<mapWidth;column++){
                if(this.moveMap[row][column]>=0){//如果可到达该地点
                    if(this.targetMap[row][column]<=this.weapon.attackDistance){//如果是在攻击距离内
                        if(this.targetMap[row][column]>farthestCouldAttackDistance){
                            farthestCouldAttackPosY=row;
                            farthestCouldAttackPosX=column;
                            farthestCouldAttackDistance=this.targetMap[row][column];
                        }
                    }else{//不在攻击距离内
                        if(this.targetMap[row][column]<nearestCannotAttackDistance){
                            nearestCannotAttackPosY=row;
                            nearestCannotAttackPosX=column;
                            nearestCannotAttackDistance=this.targetMap[row][column];
                        }
                    }
                }
            }
        }

        if(farthestCouldAttackDistance!=-Infinity){
            return [farthestCouldAttackPosY,farthestCouldAttackPosX];
        }else if(nearestCannotAttackDistance!=Infinity){
            return [nearestCannotAttackPosY,nearestCannotAttackPosX];
        }

        return null;//无地可去时返回null
    
    };//getTargetPos函数结束
    
    this.move=function(targetY,targetX){
        //设置新的map和人物的位置参数
        map[this.pos[0]][this.pos[1]]=0;
        map[targetY][targetX]=this.id;
        this.pos=[targetY,targetX];
    };
    
    this.getToAttackPerson=function(){
        if(this.id<0){
            for(var i=0;i<players.length;i++){
                var distance=Math.abs(this.pos[0]-players[i].pos[0])+Math.abs(this.pos[1]-players[i].pos[1]);
                if(distance<=this.weapon.attackDistance){
                    return players[i];
                }
            }
            for(var i=0;i<friends.length;i++){
                var distance=Math.abs(this.pos[0]-friends[i].pos[0])+Math.abs(this.pos[1]-friends[i].pos[1]);
                if(distance<=this.weapon.attackDistance){
                    return friends[i];
                }
            }
        }else{
            for(var i=0;i<enemies.length;i++){
                var distance=Math.abs(this.pos[0]-enemies[i].pos[0])+Math.abs(this.pos[1]-enemies[i].pos[1]);
                if(distance<=this.weapon.attackDistance){
                    return enemies[i];
                }
            }
        };

        return null;//没有人在攻击范围内，返回null
    };

    this.act=function(){
        operatingAI=this;

        if(this.hp<=this.maxHp*0.2){//如果生命值不足则补充生命值
            for(var i=0;i<items.length;i++){
                if(items[i].function=='+hp'){
                    this.use(i);
                    this.rest();
                    return;
                }
            }
        }
        
        var toAttackPerson=this.getToAttackPerson();
        if(toAttackPerson){//如果可攻击则攻击
            this.attack(toAttackPerson);
        }else{//不可攻击则接近目标
            var targetPos=this.getTargetPos();
            if(targetPos!=null){
                this.move(targetPos[0],targetPos[1]);
                moveVisiblePerson(this,targetPos[0],targetPos[1]);
                
                var clearIntervalFlag;
                function _toAttackAfterMove(AI){
                    if(_toAttackAfterMove.haveRun){
                        clearInterval(clearIntervalFlag);
                        return;
                    }
                    if(AI.hasMoved){
                        _toAttackAfterMove.haveRun=true;
                        //移动后尝试攻击
                        var toAttackPerson=AI.getToAttackPerson();
                        if(toAttackPerson){//可攻击
                            AI.attack(toAttackPerson);
                        }else{//不可攻击
                            AI.rest();
                        }
                    }
                };
                _toAttackAfterMove.haveRun=false;
                clearIntervalFlag=setInterval(function(){_toAttackAfterMove(operatingAI);},500);
            }else{//不可移动，原地补血休息
                this.hp+=Math.round(this.maxHp*0.1);
                if(this.hp>this.maxHp){
                    this.hp=this.maxHp;
                }
                showUseOrRestPerson(this);
                this.rest();
            }
        }

    };


}

