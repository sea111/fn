$(function(){
	//农业农村产值分析
	function pie(id,echartData){
		var nyncPie=echarts.init(document.getElementById(id));
		var scale = 1.3;
		var rich = {
		    yellow: {//字体为黄色
		        color: "#ffc72b",
		        fontSize: 13 * scale,
		        padding: [2, 4],
		        align: 'center'
		    },
		    total: {//总数
		        color: "#ffc72b",
		        fontSize: 14 * scale,
		        align: 'center'
		    },
		    white: {//字体为白色
		        color: "#fff",
		        align: 'center',
		        fontSize: 13 * scale,
		        padding: [3, 0]
		    },
		    hr: {//水平线
		        borderColor: '#0b5263',
		        width: '80%',
		        borderWidth: 1,
		        height: 0,
		    }
		}
		option = {
		    title: {
		        text:'农村农业总产值',
		        left:'center',
		        top:'46%',
		        padding:[16,0],
		        textStyle:{
		            color:'#fff',
		            fontSize:12*scale,
		            align:'center'
		        }
		    },
		    legend: {
		        selectedMode:false,
		        formatter: function(name) {
		            var total = 0; //各科正确率总和
		            var averagePercent; //综合正确率
		            echartData.forEach(function(value, index, array) {
		                total += value.value;
		            });
		            return '{total|' + total +'}';
		        },
		        data: [echartData[0].name],
		        left: 'center',
		        top: '40%',
		        icon: 'none',
		        align:'center',
		        textStyle: {
		            color: "#fff",
		            fontSize: 14 * scale,
		            rich: rich
		        },
		    },
		    series: [{
		        name: '农村农业总产值',
		        type: 'pie',
		        //radius: ['42%', '50%'],
		        radius : ['44%','60%'],  
		        hoverAnimation: false,
		        color: ['#2c81cd', '#cdad2c', '#2ccbcd', '#2ccd7f','#a16048'],
		        label: {
		            normal: {
		                formatter: function(params, ticket, callback) {
		                    var total = 0; //考生总数量
		                    var percent = 0; //考生占比
		                    echartData.forEach(function(value, index, array) {
		                        total += value.value;
		                    });
		                    return '\n\n{white|' + params.name + '}\n{yellow|' + params.value + '}';
		                },
		                rich: rich
		            },
		        },
		        labelLine: {//线到字的距离
		            normal: {
		                length: 30 * scale,
		                length2: 0,
		                lineStyle: {
		                    color: '#0b5263'
		                }
		            }
		        },
		        data: echartData
		    }]
		};
		nyncPie.setOption(option);
	}
	pie("nyncPie1",[{value: 595078,name: '稻、玉米产值'}, {value: 319879,name: '小麦产值'}, {value: 1399789,name: '蔬菜产值'}, {value: 16657,name: '瓜类产值'},{value: 17042,name: "油料产值"}]);
	pie("nyncPie2",[{value: 597949,name: '稻、玉米产值'}, {value: 346025,name: '小麦产值'}, {value: 1412560,name: '蔬菜产值'}, {value: 130270,name: '瓜类产值'},{value: 17042,name: "油料产值"}]);
	pie("nyncPie3",[{value: 595078,name: '稻、玉米产值'}, {value: 319879,name: '小麦产值'}, {value: 1412560,name: '蔬菜产值'}, {value: 131582,name: '瓜类产值'},{value: 131582,name: "油料产值"}]);
	pie("nyncPie4",[{value: 597949,name: '稻、玉米产值'}, {value: 346196,name: '小麦产值'}, {value: 1399789,name: '蔬菜产值'}, {value: 130270,name: '瓜类产值'},{value: 16657,name: "油料产值"}]);
	pie("nyncPie5",[{value: 597949,name: '稻、玉米产值'}, {value: 346025,name: '小麦产值'}, {value: 1403283,name: '蔬菜产值'}, {value: 131582,name: '瓜类产值'},{value: 16657,name: "油料产值"}]);
	pie("nyncPie6",[{value: 601488,name: '稻、玉米产值'}, {value: 346196,name: '小麦产值'}, {value: 1412560,name: '蔬菜产值'}, {value: 130038,name: '瓜类产值'},{value: 17240,name: "油料产值"}]);
	pie("nyncPie7",[{value: 595078,name: '稻、玉米产值'}, {value: 319879,name: '小麦产值'}, {value: 1399789,name: '蔬菜产值'}, {value: 130270,name: '瓜类产值'},{value: 17042,name: "油料产值"}]);
	
	//主导作物产量分析
	function nyncBar(id,legend,ydata,data1,data2,data3,data4,data5,line1,line2,line3,line4,line5){
		var nyncBar=echarts.init(document.getElementById(id));
		var option={
	        tooltip : {
	            trigger: 'axis',
	        },
	        legend: {
	            data:legend,
	             selectedMode:'single',
	            x:'18%',
	            y:'10%',
	            textStyle:{
	                color:'#2885d1',
	                fontSize:'14',
	            },
	            itemGap:22,//各个item之间的间隔
	            itemWidth:12,//图例图形宽度
	            //itemHeight:7//图例图形高度
	        },
	        color:['#28cbd1','#28cc89','#2885d1',"#c5ae34","#a16048"],//修改的颜色
	        xAxis:[
	            {
	                type:'category',
	                data:ydata,
	                axisTick : {    // 轴标记
	                    show:false
	                },
	                axisLine : {    // 轴线
	                    show: true,
	                    lineStyle: {//水平州的颜色
	                        color: '#899faf',
	                        type: 'solid',
	                        width: 1
	                    }
	                },
	                axisLabel : {
	                    show:true,
	                    formatter: '{value}',
	                    textStyle: {//水平轴字体颜色
	                        color: '#abbfcb',
	                        fontSize: 12,
	                    }
	                },
	                splitLine : {//去掉背景曲线
	                    show:false,
	                }
	            }
	        ],
	        yAxis:[
	        	{  
		            type : 'value',  
		            name : "吨",
		            position: 'left', 
		            splitLine : {//去掉背景曲线
		                show: false
		            },
		            axisTick : {    // 轴标记
	                    show:false
	                },
//		            boundaryGap:true, //两端留空白
		            axisLine : {    // 轴线
	                    show: true,
	                    lineStyle: {//水平州的颜色
	                        color: '#899faf',
	                        type: 'solid',
	                        width: 1
	                    }
	                },
		            axisLabel : {  //纵坐标的设置
		                show:true,  
		                interval: 'auto',    // {number}  
		                margin: 4,  
		                formatter: '{value}',    //纵坐标的值{value}万亩 Template formatter!  
		                textStyle: {  
		                    color: '#899faf',   
		                    fontSize: 12,   
		                }  
		            },  
		        },  
		        {  
		            type : 'value',  //右侧纵坐标的值
		            name : "亩",  
		            axisLine : {    // 轴线
	                    show: true,
	                    lineStyle: {//水平州的颜色
	                        color: '#899faf',
	                        type: 'solid',
	                        width: 1
	                    }
	                },
	                axisTick : {    // 轴标记
	                    show:false
	                },
		            axisLabel : {  
		                formatter: function (value) {   
		                    return value
		                },
		                textStyle: {  
		                    color: '#899faf',   
		                    fontSize: 12,   
		                } 
		            }  
		        }  

	        ],
	        series : [
	            {
	                type:'bar',
	                name:'稻、玉米',
	                //barGap:'0%',//柱间距离
	                barWidth :35,//柱图宽度
	                data:data1,
	            },
	            {
	                name:'小麦',
	                type:'bar',
	                barWidth :35,
	                data:data2
	            },
	            {
	                name:'蔬菜',
	                type:'bar',
	                barWidth :35,
	                data:data3
	            },
	            {
	                name:'瓜类',
	                type:'bar',
	                barWidth :35,
	                data:data4
	            },
	            {
	                name:'油料',
	                type:'bar',
	                barWidth :35,
	                data:data4
	            },
	            {
	                name:'稻、玉米',
	                type:'line',
	                yAxisIndex: 1,
	                smooth:true,//折线图趋于平缓
	                data:line1,
		        },
	            {
	                name:'小麦',
	                type:'line',
	                yAxisIndex: 1,
	                smooth:true,//折线图趋于平缓
	                data:line2
	            },
	            {
	                name:'蔬菜',
	                type:'line',
	                yAxisIndex: 1,
	                smooth:true,//折线图趋于平缓
	                data:line3
	            },
	            {
	                name:'瓜类',
	                type:'line',
	                yAxisIndex: 1,
	                smooth:true,//折线图趋于平缓
	                data:line4
	            },
	            {
	                name:'油料',
	                type:'line',
	                yAxisIndex: 1,
	                smooth:true,//折线图趋于平缓
	                data:line5
	            },
	        ]
	    }
		nyncBar.setOption(option);
	}
	nyncBar("nyncBar",["稻、玉米","小麦","蔬菜","瓜类","油料"],["2014","2015","2016"],[597949,601488,595078],[346025,346196,319879],[1403283,1412560,1399789],[131582,130038,130270],[16657,17240,17042],["998351","998554","998559"],["891012","891019","884550"],["453470","492750","492150"],["48261","46800","47850"],[84926,84902,85051]);
	
	//手动自动转换显示隐藏
	function toggle(ele,obj1,obj2,obj3,obj4){
		$(ele).click(function(){
			$(obj1).css({"display":"block"});
			$(obj2).css({"display":"block"});
			$(obj3).css({"display":"none"});
			$(obj4).css({"display":"none"});
		})
	}
	toggle(".sd","#zt","#dqzt","","");
	toggle(".zd","","","#zt","#dqzt");
	toggle(".sds","#sdsb","#dqzts","","");
	toggle(".zds","","","#sdsb","#dqzts");
	
	//手动和自动点击
	function dayClick(clickObj,obj1,obj2,obj3,obj4,text){
		$(clickObj).on("click",function(){
			$(obj1).css({"background": "#28cbd1","color":"#072a4b","border-radius":"15px"});
			$(obj2).css({"background": "#0c65a7","color":"#fff","border-radius":"15px"});
			$(obj3).css({"background": "#0c65a7","color":"#fff","border-radius":"15px"});		
			$(obj4).text(text);
		})
	}
	dayClick(".zd",'.zd','.sd','','','');
	dayClick(".sd",'.sd','.zd','','','');
	dayClick(".zds",'.zds','.sds','','','');
	dayClick(".sds",'.sds','.zds','','','');
	dayClick(".open",'.open','.close','','.dq-open','开');
	dayClick(".close",'.close','.open','','.dq-open','关');
	dayClick(".sdzk",'.sdzk','.sdtz','.sdsl','.dqzk','展开');
	dayClick(".sdtz",'.sdtz','.sdzk','.sdsl','.dqzk','停止');
	dayClick(".sdsl",'.sdsl','.sdtz','.sdzk','.dqzk','收拢');
	/*dayClick(".dqzk",'.dqzk','.dqtz','.dqsl');
	dayClick(".dqtz",'.dqtz','.dqzk','.dqsl');
	dayClick(".dqsl",'.dqsl','.dqzk','.dqtz');*/
		
	//水泵、天窗、风机、湿帘
	function changeType(ele,obj1,obj2){
		$(ele).click(function(){
			$(obj1).css({"display":"block"});
			$(obj2).css({"display":"none"});
		})
	}
	changeType(".zdp",".yc-box",".tc-box");
	changeType(".tc",".tc-box",".yc-box");
	changeType(".fj",".yc-box",".tc-box");
	changeType(".sl",".yc-box",".tc-box");
	
	//农业农村产值分析
	function changeObj(objClick,obj1,back1,back2,color1,color2,id1,id2,id3,id4,id5,id6,id7){
		$(objClick).on("click",obj1,function(){
			$(this).css({
				"background":back1,
				"color":color1
			}).siblings().css({
				"background":back2,
				"color":color2
			})
			var index=$(this).index();
			if(index==0){
				$(id1).css("display","block");$(id2).css("display","none");$(id3).css("display","none");$(id4).css("display","none");$(id5).css("display","none");$(id6).css("display","none");$(id7).css("display","none");
			}else if(index==1){
				$(id2).css("display","block");$(id1).css("display","none");$(id3).css("display","none");$(id4).css("display","none");$(id5).css("display","none");$(id6).css("display","none");$(id7).css("display","none");			
			}else if(index==2){
				$(id3).css("display","block");$(id1).css("display","none");$(id2).css("display","none");$(id4).css("display","none");$(id5).css("display","none");$(id6).css("display","none");$(id7).css("display","none");				
			}else if(index==3){
				$(id4).css("display","block");$(id1).css("display","none");$(id2).css("display","none");$(id3).css("display","none");$(id5).css("display","none");$(id6).css("display","none");$(id7).css("display","none");				
			}else if(index==4){
				$(id5).css("display","block");$(id1).css("display","none");$(id2).css("display","none");$(id3).css("display","none");$(id4).css("display","none");$(id6).css("display","none");$(id7).css("display","none");				
			}else if(index==5){
				$(id6).css("display","block");$(id1).css("display","none");$(id2).css("display","none");$(id3).css("display","none");$(id4).css("display","none");$(id5).css("display","none");$(id7).css("display","none");				
			}else if(index==6){
				$(id7).css("display","block");$(id1).css("display","none");$(id2).css("display","none");$(id3).css("display","none");$(id4).css("display","none");$(id5).css("display","none");$(id6).css("display","none");				
			}
		})
	}
	changeObj(".nync-ul","li","#1d9cd9","#003175","#0d1b2c","#29c5fe","#nyncPie1","#nyncPie2","#nyncPie3","#nyncPie4","#nyncPie5","#nyncPie6","#nyncPie7");
	
	//远程物联网控制
	$(".ycwljk").on("click","li",function(){
		
		$(this).css({
			"background":"#28cbd1",
			"border-radius":"15px",
			"color":"#072a4b"
		}).siblings().css({
			"background":"#0f54a0",
			"border-radius":"15px",
			"color":"#fff"
		})
	})
		
	//弹框事件
	function jdalert(objClick,objOpen,objClose,type,mianji,pinzh,fzr,top,left,obj2,position2,top2,left2){
		$(objClick).click(function(){
			$(objOpen).css({"display":"block","top":top,"left":left});
			
			$(".jd-type").text(type);
			$(".jd-mj").text(mianji);
			$(".jd-pz").text(pinzh);
			$(".jd-fzr").text(fzr);
		})
		$(obj2).css({"position":position2,"top":top2,"left":left2})//基地闪烁的定位
	}
	jdalert(".lfnc",".jd-alert",".jd-close","粮食双减基地","610亩","常规稻麦","许黎晓","13%","-10%",".lfnc","absolute","6%","30%");
	jdalert(".cync",".jd-alert",".jd-close","蔬菜双减基地","400亩","毛豆、冬瓜、青菜、青椒、大白菜","吴丽华","19%","-10%",".cync","absolute","15%","24%");	
	jdalert(".zxnc",".jd-alert",".jd-close","粮食双减基地","510亩","常规稻麦","张敬思","16%","0%",".zxnc","absolute","11%","41%");
	jdalert(".fcnc",".jd-alert",".jd-close","有机稻米基地","520亩","有机稻米","曹兆林","25%","-18%",".fcnc","absolute","25%","13%");	
	jdalert(".nxnc",".jd-alert",".jd-close","有机稻米基地","767亩","有机稻米","卞恩新","23%","4%",".nxnc","absolute","22%","46%");	
	jdalert(".hfjnc",".jd-alert",".jd-close","粮食双减基地","544亩","常规稻麦","陈应付","28%","-2%",".hfjnc","absolute","30%","38%");
	jdalert(".xcnc",".jd-alert",".jd-close","蔬菜双减基地","210亩","芦笋","刘军山","29%","9%",".xcnc","absolute","32%","58%");
	jdalert(".lgnc",".jd-alert",".jd-close","有机稻米基地","650亩","有机稻米","李刚","34%","2%",".lgnc","absolute","41%","46%");
	jdalert(".hmnc",".jd-alert",".jd-close","蔬菜双减基地","450亩","草莓、杭椒、西瓜","顾银官","38%","-24%",".hmnc","absolute","48%","6%");
	jdalert(".xtnc",".jd-alert",".jd-close","粮食双减基地","500亩","常规稻麦","韩朝阳","41%","-8%",".xtnc","absolute","53%","32%");
	jdalert(".yjgnc",".jd-alert",".jd-close","粮食双减基地","500亩","常规稻麦","王刚","44%","20%",".yjgnc","absolute","59%","69%");
	jdalert(".lqnc",".jd-alert",".jd-close","有机稻米基地","2600亩","有机稻米","赵红卫","58%","-25%",".lqnc","absolute","82%","3%");	
	
	//进入基地和二维码关闭
	function close(objClick,obj){
		$(objClick).click(function(){
			$(obj).css("display","none");
		})
	}
	close(".jd-close",".jd-alert");	
	close("#sy-close",".sy-alert");
		
	//农产品溯源
	function syClick(objClick,obj1,obj2){
		$(objClick).on("click",obj1,function(){
			$(this).parent().parent().parent().next(obj2).css({"display":"block"});
		})
	}
	syClick("#ncpsy-con","li",".sy-alert");
	
	//进入基地
	$(".jrjd").click(function(){
		window.open("jdhj.html");
	})
	
	//向上滚动
	function topRun(id1,id2,id3){
		var area =document.getElementById(id1);
		var con1 = document.getElementById(id2);
		var con2 = document.getElementById(id3);
		con2.innerHTML=con1.innerHTML;
		if(area.scrollTop>=con1.offsetHeight){
			area.scrollTop=0;
		}else{
			area.scrollTop++;
		}
		var time = 50;
		var mytimer=setInterval(function(){
			if(area.scrollTop>=con1.offsetHeight){
				area.scrollTop=0;
			}else{
				area.scrollTop++;
			}
		},time);
		area.onmouseover=function(){
			clearInterval(mytimer);
		}
		
		area.onmouseout=function(){
			mytimer=setInterval(function(){
				if(area.scrollTop>=con1.offsetHeight){
					area.scrollTop=0;
				}else{
					area.scrollTop++
				}
			},time);
		}
	}
	topRun("scrollBox","con1","con2");    
    topRun("yjfx","yjfx-con","yjfx-cons");
	topRun("nywlwBox","nywlwcon1","nywlwcon2");
	function topRuns(id1,id2,id3){
		var area =document.getElementById(id1);
		var con1 = document.getElementById(id2);
		var con2 = document.getElementById(id3);
		con2.innerHTML=con1.innerHTML;
		if(area.scrollTop>=con1.offsetHeight){
			area.scrollTop=0;
		}else{
			area.scrollTop++;
		}
		var time = 50;
		var mytimer=setInterval(function(){
			if(area.scrollTop>=con1.offsetHeight){
				area.scrollTop=0;
			}else{
				area.scrollTop++;
			}
		},time);
		area.onmouseover=function(){
			clearInterval(mytimer);
		}
		$(".sy-alert").mouseover(function(){
			clearInterval(mytimer);
		})
		area.onmouseout=function(){
			mytimer=setInterval(function(){
				if(area.scrollTop>=con1.offsetHeight){
					area.scrollTop=0;
				}else{
					area.scrollTop++
				}
			},time);
		}
	}
	/*字体向上滚动*/
    topRuns("ncpsy","ncpsy-con","ncpsy-cons");
    
})
















