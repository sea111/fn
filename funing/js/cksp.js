$(function(){
	
	//视频切换图表
	function buttonClick(element,img1,img2){
		$(element).toggle(function(){
		    $(this).attr("src",img1);
		},function(){
		    $(this).attr("src",img2);
		}).attr("src",img2);
	}
	buttonClick(".one","images/fn-one-blue.png","images/fn-one-white.png");
	buttonClick(".two","images/fn-two-blue.png","images/fn-two-white.png");
	buttonClick(".three","images/fn-three-blue.png","images/fn-three-white.png");
	buttonClick(".four","images/fn-four-blue.png","images/fn-four-white.png");
	buttonClick(".fullScreen","images/fn-fullScreen-blue.png","images/fn-fullScreen-white.png");
	buttonClick(".left-up","images/fn-left-up-blue.png","images/fn-left-up-white.png");
	buttonClick(".center-up","images/fn-center-up-blue.png","images/fn-center-up-white.png");
	buttonClick(".right-up","images/fn-right-up-blue.png","images/fn-right-up-white.png");
	buttonClick(".center-left","images/fn-center-left-blue.png","images/fn-center-left-white.png");
	buttonClick(".center-right","images/fn-center-right-blue.png","images/fn-center-right-white.png");
	buttonClick(".left-down","images/fn-left-down-blue.png","images/fn-left-down-white.png");
	buttonClick(".center-down","images/fn-center-down-blue.png","images/fn-center-down-white.png");
	buttonClick(".right-down","images/fn-right-down-blue.png","images/fn-right-down-white.png");
	buttonClick(".datu-white","images/fn-datu-blue.png","images/fn-datu-white.png");
	buttonClick(".xiaotu-white","images/fn-xiaotu-blue.png","images/fn-xiaotu-white.png");
	buttonClick(".bugle-white","images/fn-bugle-blue.png","images/fn-bugle-white.png");
	buttonClick(".speaker-mute","images/fn-speaker-mute-blue.png","images/fn-speaker-mute-white.png");
	buttonClick(".voice-tube","images/voice-tube-blue.png","images/voice-tube-white.png");
	buttonClick(".mute-white","images/fn-mute-blue.png","images/fn-mute-white.png");
	buttonClick(".contr-play","images/fn-contr-play-blue.png","images/fn-contr-play-white.png");
	buttonClick(".closev-white","images/fn-closev-blue.png","images/fn-closev-white.png");
	
	function circle(ele,back1,back2){
		$(ele).click(function(){
			$(this).find("i").css("backfground",back1).siblings().find("i").css("background",back2)
			
		})
	}
	circle(".video-center-box>span","#e8d252","#fff")


})
