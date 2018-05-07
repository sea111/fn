$(function(){
	
	//基地环境弹窗关闭
	$(".jd-alert-close").click(function(){
		$(".jd-alert").hide();
		$(".fn-type").show();
		$("#map").show();
		//$("#maps").show();
		$(".map-top").show();
		$(".map-bottom").show();
		$(".map-left").show();
		$(".map-right").show();
	})
	//基地环境和查看视频切换
	function objClick(element,obj1,obj2,obj3){
		$(element).click(function(){
			$(obj1).css({"display":"block"});
			$(obj2).css({"display":"none"});
			$(obj3).css({"display":"block"});
		})
	}
	objClick(".jd-hjxq","#jd-alert-box","#jd-video-box","");
	objClick(".jd-cksp","#jd-video-box","#jd-alert-box","");
	
	function colorChange(ele){
		$(ele).click(function(){
			$(this).css({
				"background":"#00c0ff","color":"#0d1b2c"
				}).siblings().css({
					"background":"#1958ab","color":"#00c0ff"
				})
		})
	}
	colorChange(".jd-hjxq");
	colorChange(".jd-cksp");
	
	
	//轮播点击
	$(".alert-center-box").hover(function(){
	    $(".lr").show();
	},function(){
	    $(".lr").hide();
	});
	var a=0;
	var leng=$(".jd-alert-center li").length;
   //点击左右按钮，图片进行切换效果
   $(".pre").click(function(){
    a--;
    a=(a+leng)%leng;
     $(".jd-alert-center").stop().animate({marginLeft:-168*a},"slow");
   });
   $(".next").click(function(){
	  a++;
	//++a;
    //a=(a+leng)%leng;
    a=a%leng;
  
     $(".jd-alert-center").stop().animate({marginLeft:-206*a},"slow");
   });
	
})
