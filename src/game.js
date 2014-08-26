
var gameLayer = null;
var menulayer = null;
var gameOverLayer = null;
var totalTime = 15;
var CAONIMA_SPEED = 120;
var PLAYER_W = 66;
var PLAYER_H = 118;
var PLAYER_OX = 0;
var MOVING_OY = 118;

var GameState = {
		NOTBEGIN : 1,
		GAMING : 2,
		GAMEOVER : 3
}

var ItemType = {
		STONE : 0, //石头
		SHIT : 1, //便便
		ROCKET : 2, //火箭
}

var GameLayer = cc.LayerColor.extend({
	caonima: null,
	s : null,
	gameState : null,
	timeSlider : null,
	hpSlider : null,
	timeCountTemp : null,
	items : new Array(),
	itemListener : null,
	zidan : new Array(),
	hitTime : null,
	hp : 100,
	ctor:function () {
		this.s = cc.winSize;
		var size = cc.winSize;
		
		this._super(cc.color.GREEN,cc.winSize.width,cc.winSize.height);
		
		//load background
		var background = new cc.Sprite(res.background);
		background.attr({
			x: size.width / 2,
			y: size.height / 2,			
		});
		this.addChild(background, 0);
		
		//load caonima
		/*
		ccs.armatureDataManager.addArmatureFileInfo(res.caonima);
		this.caonima = ccs.Armature.create("CNM");
		this.caonima.getAnimation().play("run");
		this.addChild(this.caonima);
		*/
		var tex = cc.textureCache.addImage(res.yangtuo);
		var frame,
		rect = cc.rect(0, 0, PLAYER_W, PLAYER_H),
		moving_frames = [], trapped_frames = [];
		for (var i = 0; i < 6; i++) {
			rect.x = PLAYER_OX + i * PLAYER_W;
			frame = new cc.SpriteFrame(tex, rect);
			trapped_frames.push(frame);
		}
		rect.y = MOVING_OY;
		for (var i = 0; i < 4; i++) {
			rect.x = PLAYER_OX + i * PLAYER_W;
			frame = new cc.SpriteFrame(tex, rect);
			moving_frames.push(frame);
		}
		var moving_animation = new cc.Animation(moving_frames, 0.2);
		this.moving_action = cc.animate(moving_animation).repeatForever();
		var trapped_animation = new cc.Animation(trapped_frames, 0.2);
		this.trapped_action = cc.animate(trapped_animation).repeatForever();
		this.caonima = new cc.Sprite(moving_frames[0]);

		this.caonima.attr({
			anchorX : 0.5,
			anchorY : 0,
			x : size.width / 2.0 - 50,
			y : size.height / 2.0 + 50,
			scale : 0.7
		});
		this.caonima.stopAllActions();
		this.caonima.runAction(this.trapped_action);

		this.addChild(this.caonima,2);
		
		//time bar
		this.timeSlider = new ccui.Slider();
		this.timeSlider.setTouchEnabled(false);
		this.timeSlider.loadBarTexture("res/sliderTrack.png");
		this.timeSlider.loadProgressBarTexture("res/sliderProgress.png");
		this.timeSlider.x = 10;
		this.timeSlider.y = this.s.height /2 ;
		this.timeSlider.setPercent(100);
		this.timeSlider.setRotation(270);
		this.addChild(this.timeSlider,3);
		
		//hp bar
		this.hpSlider = new ccui.Slider();
		this.hpSlider.setTouchEnabled(false);
		this.hpSlider.loadBarTexture("res/sliderTrack.png");
		this.hpSlider.loadProgressBarTexture("res/sliderProgress.png");
		this.hpSlider.x = this.s.width - 10;
		this.hpSlider.y = this.s.height /2 ;
		this.hpSlider.setPercent(100);
		this.hpSlider.setRotation(270);
		this.addChild(this.hpSlider,3);
		
		//init gamestate
		this.gameState = GameState.NOTBEGIN;
		//callback each frame
		this.schedule(this.doStep);
	},	
	
	generateSprite :function(type){
		var sprite = null;
		switch(type){
		case ItemType.STONE:
			var tex = cc.textureCache.addImage(res.stoneImage);
			var rect = cc.rect(0,0,110,110);
			var frame = new cc.SpriteFrame(tex, rect);
			sprite = new cc.Sprite(frame);
			break;
		case ItemType.SHIT:
			var tex = cc.textureCache.addImage(res.shitImage);
			var rect = cc.rect(0,0,110,110);
			var frame = new cc.SpriteFrame(tex, rect);
			sprite = new cc.Sprite(frame);
			break;
		case ItemType.ROCKET:
			var tex = cc.textureCache.addImage(res.rocketImage);
			var rect = cc.rect(0,0,55,110);
			var frame = new cc.SpriteFrame(tex, rect);
			sprite = new cc.Sprite(frame);
			break;
		default:
			cc.log("error ! invalid item type: " + type);
			break;
		}
		sprite.itemType = type;
		return sprite;
	},
	
	doStep:function(duration) {
		if(gameLayer.gameState == GameState.GAMING){
			//cc.log(gameLayer.zidan.length);
			
			var p = duration * 100;
			gameLayer.timeCountTemp += p;
			var percent = 100 - gameLayer.timeCountTemp / totalTime;
			gameLayer.timeSlider.setPercent(percent);
			
			gameLayer.hpSlider.setPercent(gameLayer.hp);
			
			if(percent<=0){
				cc.log("time over!");
				gameLayer.gameOver();
			}
			
			//clear zidan, check hit
			var newZidan = [];
			for (var i = 0; i < gameLayer.zidan.length; i++) {
				var zidan = gameLayer.zidan[i];
				if(zidan.alive){
					//碰撞检测
					var caonimaBox = gameLayer.caonima.getBoundingBox();
					var zidanBox = zidan.getBoundingBox();
					
					if(cc.rectIntersectsRect(zidanBox, caonimaBox)){
						cc.log("hit!");
						gameLayer.hp -= 15;
						cc.log(gameLayer.hp);
						zidan.alive = false;
						gameLayer.removeChild(zidan);
						if(gameLayer.hp<=0){
							gameLayer.gameOver();
						}
					}else{
						newZidan.push(zidan)
					}
					
				}else{
					gameLayer.removeChild(zidan);
				}
			}
			gameLayer.zidan = newZidan;
			
			//add item
			if(gameLayer.timeCountTemp - gameLayer.hitTime > 50 && gameLayer.items.length == 0){
				gameLayer.addItems();
			}
		}
	},
	init:function() {
		this.caonima.x = this.s.width / 2.0 - 50;
		this.caonima.y = this.s.height / 2.0 + 50;
		this.gameState = GameState.GAMING;
		this.timeCountTemp = 0;
		this.hitTime = 0;
		this.hpSlider.percent = 100;
		this.caonimaRun();
		for(var i=0;i<this.zidan.length;++i){
			this.zidan[i].alive = false;
		}
		this.hp = 100;
		this.addItems();
	},
	gameOver:function(){
		gameLayer.gameState = GameState.GAMEOVER;
		gameOverLayer.setVisible(true);
		gameLayer.setVisible(false);
		gameOverLayer.show();
	},
	caonimaRun:function() {
		if(gameLayer.gameState != GameState.GAMING){
			return;
		}
		var x = gameLayer.caonima.x;
		var y = gameLayer.caonima.y;
		
		var targetX = cc.random0To1() * 320;
		if(targetX < 50) targetX = 50;
		if(targetX > 280) targetX = 280;
		var targetY = cc.random0To1() * (480 - 100) + 100;
		if(targetY > 360) targetY = 360;
		//cc.log("x=" + targetX + ", y=" + targetY);
		var randomSpeed = CAONIMA_SPEED + cc.random0To1() * 100;
		var time = cc.pDistance(cc.p(x,y), cc.p(targetX, targetY)) / randomSpeed;
		var action = cc.Sequence.create(
				cc.MoveTo.create(time, cc.p(targetX, targetY)),
				cc.CallFunc.create(gameLayer.caonimaRun)
		);
		gameLayer.caonima.runAction(action);
	},
	clearItems : function(){
		if(this.items.length > 0){
			for (var i = 0; i < this.items.length; i++) {
				this.removeChild(this.items[i]);
			}
			this.items = new Array();
		}
	},	
	addItems: function(){
		this.clearItems();
		
		for(var i=0;i<5;i++){
			var randomItem = Math.floor(cc.random0To1() * 2 + 0.5);
			var sprite = this.generateSprite(randomItem);
			sprite.attr({
				x: 40 + i * 60,
				y: 0,
				scale: 0.5,
			});
			
			this.items.push(sprite);
			var action = cc.MoveBy.create(0.3, cc.p(0,60)).easing(cc.easeIn(2));
			sprite.runAction(action);
			this.addChild(sprite, 0);
			
			cc.eventManager.addListener({
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches: true,
				onTouchBegan: this.onTouchBegan,
				onTouchMoved: this.onTouchMoved,
				onTouchEnded: this.onTouchEnded,
			}, sprite);
		}
	},
	onTouchBegan:function(touch, event){
		var target = event.getCurrentTarget(); 
		var locationInNode = target.convertToNodeSpace(touch.getLocation());    
		var s = target.getContentSize();
		var rect = cc.rect(0, 0, s.width, s.height);
		if (cc.rectContainsPoint(rect, locationInNode)) {
			target.y += 15;
			return true;
		}
		return false;
	},
	onTouchMoved:function(touch, event){
		var target = event.getCurrentTarget();
		var delta = touch.getDelta();
		//target.x += delta.x;
		//target.y += delta.y;
		//cc.log(delta.y);
		return true;
	},
	onTouchEnded:function(touch, event){
		//cc.log("on touch end");
		var target = event.getCurrentTarget(); 
		var locationInNode = target.convertToNodeSpace(touch.getLocation());    
		if(locationInNode.y > 30){
			var MAXPOWER = 130;
			//发射
			var powerx = locationInNode.x;
			var powery = locationInNode.y;
			if(powerx > MAXPOWER) powerx = MAXPOWER;
			if(powery > MAXPOWER) powery = MAXPOWER;
			gameLayer.hitTime = gameLayer.timeCountTemp;
			
			var sprite = gameLayer.generateSprite(target.itemType);
			cc.log(target.itemType);
			//if(target.itemType == ItemType.STONE){
				sprite.attr({
					x: target.x,
					y: target.y,
					scale: 0.5,
				});
				sprite.alive = true;
			//}
			
			gameLayer.zidan.push(sprite);
			sprite.runAction(
				cc.Sequence.create(
					cc.MoveBy.create(powery / 50, cc.p(powerx * 3, powery * 3)).easing(cc.easeOut(2.0)), 
					cc.FadeOut.create(0.3),
					cc.CallFunc.create(function() { 
						sprite.alive = false;
					})
				)
			);
			gameLayer.addChild(sprite, 0);
			
			gameLayer.clearItems();
		}else{
			target.y -= 15;
		}
		
	},
})

var GameScene = cc.Scene.extend({
	onEnter:function () {
		this._super();
		menuLayer = new MenuLayer();
		gameLayer = new GameLayer();
		gameOverLayer = new GameOverLayer();
		this.addChild(menuLayer , 0);
		this.addChild(gameLayer, 1);
		this.addChild(gameOverLayer, 2);
		gameLayer.setVisible(false);
		gameOverLayer.setVisible(false);
	}
});