var GameOverLayer = cc.LayerColor.extend({
	label: null,
	ctor:function () {
		this._super(cc.color.GREEN,cc.winSize.width,cc.winSize.height);
		var size = cc.winSize;
		
		var background = new cc.Sprite(res.background);
		background.attr({
			x: size.width / 2,
			y: size.height / 2,			
		});
		this.addChild(background, 0);
		
		/*
		var text = new ccui.Text();
		text.attr({
			string: "GAME OVER",
			x: size.width / 2,
			y: size.height / 2 + 130
		});
		text.setColor(cc.color.BLACK);
		this.addChild(text);
		*/
		
		var label = new cc.LabelTTF("恭喜你！你打败了草泥马~\n你超越了95%的好友", "宋体", 20);
		label.x = size.width / 2 ;
		label.y = size.height / 2 + 130;
		label.color = cc.color(255, 255, 255);
		this.addChild(label);
		this.label = label;
		//button
		/*
		var button = new ccui.Button();
		button.setTitleText("重来");
		button.setTouchEnabled(true);
		button.setScale9Enabled(true);
		button.loadTextures(res.replayButton, res.replayButton, "");
		button.x = size.width / 2.0 ;
		button.y = size.height / 2.0 + 30;
		button.setContentSize(cc.size(150, 48));
		button.addTouchEventListener(this.touchEvent ,this);
		this.addChild(button);

		var button = new ccui.Button();
		button.setTitleText("分享到朋友圈");
		button.setTouchEnabled(true);
		button.setScale9Enabled(true);
		button.loadTextures(res.Button_png, res.ButtonHighlighted_png, "");
		button.x = size.width / 2.0 ;
		button.y = size.height / 2.0 - 50;
		button.setContentSize(cc.size(150, 48));
		button.addTouchEventListener(this.touchEvent ,this);
		this.addChild(button);
		*/
		var button = new cc.Sprite(res.replayButton);
		button.attr({
			x: size.width / 2,
			y: size.height / 2  + 30,
			
		});
		this.addChild(button, 0);
		
		var button = new cc.Sprite(res.notifyButton);
		button.attr({
			x: size.width / 2,
			y: size.height / 2  - 50,
			
		});
		this.addChild(button, 0);
		
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ALL_AT_ONCE,
			onTouchesEnded: function (touches, event) {
				if(gameLayer.gameState == GameState.GAMEOVER){
					var touch = touches[0];
					var pos = touch.getLocation();
					if (pos.y < cc.winSize.height/2) {
						gameOverLayer.setVisible(false);
						gameLayer.setVisible(true);
						menuLayer.setVisible(false);
						gameLayer.init();
					}
				}
			}
		}, this);
		
		return true;
	},
	show: function(){
		if(100 - gameLayer.timeCountTemp / totalTime <= 0){
			this.label.setString("很抱歉，\n你在规定时间内没有击败草泥马~");
		}else{
			this.label.setString("你在" +  Math.round(gameLayer.timeCountTemp / 100 * 100) / 100 + "内击败了草泥马，\n你超越了95%的玩家！");
		}
	},
	touchEvent: function (sender, type){
		switch (type) {
		case ccui.Widget.TOUCH_ENDED:
			gameOverLayer.setVisible(false);
			gameLayer.setVisible(true);
			menuLayer.setVisible(false);
			gameLayer.init();
			break;
		default:
			break;
		}
	}
});