var MenuLayer = cc.LayerColor.extend({
	moving_action:null,
	trapped_action:null,
	player:null,
	ctor:function () {
		this._super(cc.color.GREEN,cc.winSize.width,cc.winSize.height);
		var size = cc.winSize;
		//background
		var background = new cc.Sprite(res.background);
		background.attr({
			x: size.width / 2,
			y: size.height / 2,			
		});
		this.addChild(background, 0);
		
		//animation
		/*
		ccs.armatureDataManager.addArmatureFileInfo(res.caonima);
		var armature = ccs.Armature.create("CNM");
		armature.getAnimation().play("provoke");
		armature.x = size.width / 2.0 - 50;
		armature.y = size.height / 2.0 + 50;

		//armature.getAnimation().setMovementEventCallFunc(this.animationEvent,this);
		this.addChild(armature);
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
		this.player = new cc.Sprite(moving_frames[0]);
		
		this.player.attr({
			anchorX : 0.5,
			anchorY : 0,
			x : size.width / 2.0 - 50,
			y : size.height / 2.0 + 50
		});
		this.player.stopAllActions();
		this.player.runAction(this.trapped_action);
		
		this.addChild(this.player);
		
		//text
		var label = new cc.LabelTTF("有种你打我啊~", "宋体", 20);
		label.x = size.width / 2 + 80;
		label.y = size.height / 2 + 100;
		//label.textAlign = cc.LabelTTF.TEXT_ALIGNMENT_CENTER;
		//label.boundingWidth = w;
		//label.width = w;
		label.color = cc.color(255, 255, 255);
		this.addChild(label);
		
		/*
		var text = new ccui.Text();
		text.attr({
			string: "有种你打我啊~",
			x: size.width / 2 + 80,
			y: size.height / 2 + 100,
		});
		text.setColor(cc.color.BLACK);
		this.addChild(text);
		 */
		
		//button
		var button = new cc.Sprite(res.startButton);
		button.attr({
			x: size.width / 2,
			y: size.height / 2  - 80,
			scale: 0.6,
		});
		this.addChild(button, 0);
		
		/*
		var button = new ccui.Button();
		button.setTitleText("揍它！");
		button.setTouchEnabled(true);
		button.setScale9Enabled(true);
		button.loadTextures(res.Button_png, res.ButtonHighlighted_png, "");
		button.x = size.width / 2.0;
		button.y = size.height / 2.0 - 50;
		button.setContentSize(cc.size(200, 48));
		button.addTouchEventListener(this.touchEvent ,this);
		this.addChild(button);
		*/
		
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ALL_AT_ONCE,
			onTouchesEnded: function (touches, event) {
				if(gameLayer.gameState == GameState.NOTBEGIN){
					var touch = touches[0];
					var pos = touch.getLocation();
					if (pos.y < cc.winSize.height/2) {
						gameLayer.setVisible(true);
						gameLayer.init();
						menuLayer.setVisible(false);
					}
				}
			}
		}, this);
		
		return true;
	},
	animationEvent:function (armature, movementType, movementID) {
		if (movementType == ccs.MovementEventType.loopComplete) {
			cc.log("animation event called");
		}
	},
	touchEvent: function (sender, type){
		switch (type) {
		case ccui.Widget.TOUCH_BEGAN:
			break;
		case ccui.Widget.TOUCH_MOVED:
			break;
		case ccui.Widget.TOUCH_ENDED:
			//cc.director.runScene(this.gameScene);
			
			break;
		case ccui.Widget.TOUCH_CANCELED:
			break;
		default:
			break;
		}
	}
});