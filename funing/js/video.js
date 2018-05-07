/**
 * Copyright(c) 2004-2014,浙江托普云农科技股份有限公司
 * <BR>All rights reserved
 * <BR>版    本：V3.1.0
 * <BR>摘    要：视频控制页面操作视频的js
 * <BR>作    者：yhq
 * <BR>日    期：2016-01-19 18:30
 */
var waitTitle = "待机";
var playTitle = "播放";
var failTitle = "失败";
var loadTitle = "登录中...";
var waitCode = 0;//待机
var playCode = 1;//播放
var failCode = -1;//失败
var streamType = {"1": "高清", "2": "标清"};
var presetConHeight = 200;//预置点容器的高度
var presetLineHeight = 31;//预置点的行高
////视频窗口的大小
//var winWidth = 710;
//var winHeight = 490;

var isOk = true;
var cameraList = null;//保存视频设备
var NVR = 0;//录像机的总数
var cameraSum = 0;//登录成功的不是录像机的总数
var maxWinId = 1;//保存当前的窗口数
var currStreamType = 1;//保存当前窗口的码流（清晰度），默认高清
var _currStreamType = 0;

// 全局保存当前选中窗口
var g_iWndIndex = 0; //可以不用设置这个变量，有窗口参数的接口中，不用传值
var winStreamType = Array();//保存各个窗口的清晰度
var winsCameras = Array();//保存窗口对应的视频设备信息
var camerasWinIds = Array();//保存已打开的视频设备对应的窗口编号
var openWinIds = ",";//保存已打开的视频窗口编号
var winsChannels = Array();//保存窗口对应的通道号
var winsCameraTypes = Array();//保存窗口对应的摄像头的类型（1:球机, 2:除球机以外（如：枪机））
var unOpenWinIds = ",";//保存未打开的视频的窗口编号
var winsPresetIds = Array();//保存窗口对应的预置点的id
var winsTalk = Array();//保存窗口是否在对讲中
var winsRecord = Array();//保存窗口是否在录制中
$(function () {
    //自定义视频插件启用
    if( typeof RunAiotVideo === 'function' ){
        //存在且是function
        RunAiotVideo();
    }
    // 初始化插件参数及插入插件
    WebVideoCtrl.I_InitPlugin(winWidth, winHeight, {
        iWndowType: 1,//设置默认的视频窗口分割个数
        cbSelWnd: function (xmlDoc) {
            g_iWndIndex = $(xmlDoc).find("SelectWnd").eq(0).text();
            if (winStreamType[g_iWndIndex] == 1 || winStreamType[g_iWndIndex] == 2) {
                //$("#streamType").val(winStreamType[g_iWndIndex]);//设置该窗口清晰度
                currStreamType = winStreamType[g_iWndIndex];
            } else {
                currStreamType = 1;//默认该窗口清晰度为高清
            }
            $("#streamType").val(streamType[currStreamType]);
            $("#streamTypeSel li").removeClass("active");
            $('#streamTypeSel li[value="' + currStreamType + '"]').addClass("active");

            showDoing(g_iWndIndex);//设窗口是否在对讲中或录制中的提示信息
            if (isCenter) {//视频中心
                getPresetsForCenter();//查找预置点
            } else {
                getPreset(null);//查找预置点
            }

            var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
            if (oWndInfo != null && oWndInfo.iPlayStatus == 2) {//在回放tab中，正在播放
                $(".play-control").find("a").eq(0).attr("class", "vv-pause").attr("title", "暂停");
            } else {
                $(".play-control").find("a").eq(0).attr("class", "vv-play").attr("title", "播放");
            }
        }
    });

    // 检查插件是否已经安装过
    if (-1 == WebVideoCtrl.I_CheckPluginInstall()) {
        if (confirm("您还未安装过插件，请下载WebComponentsKit.exe并进行安装！ \n提示：安装完成后请重启您的浏览器! 您还可以点击控制控制面板的下载插件按钮进行下载\n是否立即下载？")) {
            downloadFile();
        }
    } else {
        WebVideoCtrl.I_InsertOBJECTPlugin("video");
    }

    // 检查插件是否最新
    /*if (-1 == WebVideoCtrl.I_CheckPluginVersion()) {
     if (confirm("检测到新的插件版本，请下载并升级! \n  是否立即下载？")) {
     downloadFile();
     }
     return;
     }*/

    //绑定切换窗口个数按钮的点击事件
    $("#splitWins a, #splitWins div").click(function () {
        var num = $(this).attr("id");
        changeWndNum(num);
    });

    //码流的改变（清晰度）
    $("#streamTypeSel li").unbind("click").bind("click", function () {
        if ($(this).hasClass("active")) {//当前已选中
            return;
        }
        $StreamType = $(this).val();
        currStreamType = $StreamType;
        _currStreamType = $StreamType;
        $("#streamTypeSel li").removeClass("active");
        $(this).addClass("active");
        $("#streamType").val(streamType[$StreamType]);

        var obj = $("li[winId='" + g_iWndIndex + "']");
        var camera = obj.data("camera");
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
        if (camera && oWndInfo) {//视频已打开
            var $confirmContent = {"1": "提示:\n    转换为高清，清晰度将会提高，同时也将对宽带的要求提高！\n是否进行转换？"}[$StreamType] || "提示:\n    转换为标清，对宽带的要求降低，但同时清晰度将也会下降！\n是否进行转换？";
            if (confirm($confirmContent)) {
                changeStreamType(camera, $StreamType);
            }
        }
    });

    //全屏
    $("#fullscreen").click(function () {
        WebVideoCtrl.I_FullScreen(true);
    });

    /*****************************************************视频控制部分**********************************************/
        //点击打开图片抓取文件夹时
    $("#screenShot").click(function () {
        $nowPath = $("#shortPath").val();
        if ($nowPath != "") {
            //路径不为空时
            var szDirPath = WebVideoCtrl.I_OpenFileDlg(1);
        } else {
            //抓图存储的路劲为空时
            alert("抱歉，抓图保存路径暂未设置，请先进行设置");
            clickOpenFileDlg('shortPath', 0);
        }
    });

    //抓图
    $("#downPicture").click(function () {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
        if (null == oWndInfo) {
            alert("请先选中一个已在播放视频的窗口！");
            return;
        }
        //clickGetLocalCfg();//获取路径
        var idStr = "";
        if (controlOrLoop == "control") {//视频控制选项卡
            idStr = "previewPicPath";
        } else if (controlOrLoop == "loop") {//视频回放选项卡
            idStr = "playbackPicPath";
        }
        $nowPath = $("#" + idStr).val();
        if (!$nowPath) {
            alert("抱歉，抓图保存路径暂未设置，请先进行设置");
            clickOpenFileDlg(idStr, 0);
        }
        if ($("#" + idStr).val()) {
            clickCapturePic();
        }
    });

    //关闭(停止一个窗口预览)
    $("#close").click(function () {
        stopOne(g_iWndIndex);
    });

    /*****************************************************视频回放部分**********************************************/
    //初始化日期时间
    var szCurTime = dateFormat(new Date(), "yyyy-MM-dd");
    $("#startTime").val(szCurTime);
    $("#endTime").val(szCurTime);
});

//视频插件下载
function downloadFile() {
    location.href = 'http://down.zjtpyun.com/hikplug/WebComponentsKit.exe';
}

//拼接视频设备ip
function setIP(streamUrl, httpPort) {
    return streamUrl + ":" + httpPort;
}

//更改某个窗口的码流状态
function changeStreamType(camera, sType) {
    //var obj = $("li[winId='" + g_iWndIndex + "']");
    //var camera = obj.data("camera");
    if (null == camera || undefined == camera) {
        return;
    }
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szIP = setIP(camera.streamUrl, camera.httpPort),
        iChannelID = camera.channel || 1,
        bZeroChannel = false;
    if ("" == szIP) {
        return;
    }

    if (oWndInfo != null) {// 已经在播放了，先停止
        WebVideoCtrl.I_Stop();
    }
    var iRet = WebVideoCtrl.I_StartRealPlay(szIP, {
        iStreamType: sType,
        iChannelID: iChannelID,
        bZeroChannel: bZeroChannel
    });
    winStreamType[g_iWndIndex] = $StreamType;//保存该窗口清晰度
    if (0 == iRet) {//开始预览成功
    } else {
    }
}

// 获取本地参数
function clickGetLocalCfg() {
    var xmlDoc = WebVideoCtrl.I_GetLocalCfg();
    $("#netsPreach").val($(xmlDoc).find("BuffNumberType").eq(0).text());//播放库缓冲区大小
    $("#wndSize").val($(xmlDoc).find("PlayWndType").eq(0).text());//播放窗口模式(0-充满，1-4:3，2-16:9)
    $("#rulesInfo").val($(xmlDoc).find("IVSMode").eq(0).text());//是否开启规则信息
    $("#captureFileFormat").val($(xmlDoc).find("CaptureFileFormat").eq(0).text());//抓图格式
    $("#packSize").val($(xmlDoc).find("PackgeSize").eq(0).text());//录像打包大小(0-256M,1-512M,2-1G)
    $("#recordPath").val($(xmlDoc).find("RecordPath").eq(0).text());//录像文件保存路径
    $("#downloadPath").val($(xmlDoc).find("DownloadPath").eq(0).text());//回放下载文件保存路径
    $("#previewPicPath").val($(xmlDoc).find("CapturePath").eq(0).text());//抓图文件保存路径
    $("#playbackPicPath").val($(xmlDoc).find("PlaybackPicPath").eq(0).text());//回放抓图文件保存路径
    $("#playbackFilePath").val($(xmlDoc).find("PlaybackFilePath").eq(0).text());//回放录像文件保存路径
    $("#protocolType").val($(xmlDoc).find("ProtocolType").eq(0).text());//协议类型(0-TCP,2-UDP)
}

// 设置本地参数
function clickSetLocalCfg() {
    var arrXml = [];
    arrXml.push("<LocalConfigInfo>");
    arrXml.push("<PackgeSize>0</PackgeSize>");//录像打包大小(0-256M,1-512M,2-1G)
    arrXml.push("<PlayWndType>0</PlayWndType>");//播放窗口模式(0-充满，1-4:3，2-16:9)
    arrXml.push("<BuffNumberType>" + $("#netsPreach").val() + "</BuffNumberType>");//播放库缓冲区大小
    arrXml.push("<RecordPath>" + $("#recordPath").val() + "</RecordPath>");//录像文件保存路径
    arrXml.push("<CapturePath>" + $("#previewPicPath").val() + "</CapturePath>");//抓图文件保存路径
    arrXml.push("<PlaybackFilePath>" + $("#playbackFilePath").val() + "</PlaybackFilePath>");//回放录像文件保存路径
    arrXml.push("<PlaybackPicPath>" + $("#playbackPicPath").val() + "</PlaybackPicPath>");//回放抓图文件保存路径
    arrXml.push("<DownloadPath>" + $("#downloadPath").val() + "</DownloadPath>");//回放下载文件保存路径
    arrXml.push("<IVSMode>1</IVSMode>");//是否开启规则信息
    arrXml.push("<CaptureFileFormat>0</CaptureFileFormat>");//抓图格式
    arrXml.push("<ProtocolType>0</ProtocolType>");//协议类型(0-TCP,2-UDP)
    arrXml.push("</LocalConfigInfo>");

    var iRet = WebVideoCtrl.I_SetLocalCfg(arrXml.join(""));
    if (0 == iRet) {//本地配置设置成功
    } else {
    }
}

// 打开选择框 0：文件夹  1：文件
function clickOpenFileDlg(id, iType) {
    var szDirPath = WebVideoCtrl.I_OpenFileDlg(iType);
    if (szDirPath != -1 && szDirPath != "" && szDirPath != null) {
        $("#" + id).val(szDirPath);
    }
    clickSetLocalCfg();//设置本地参数
}

// 抓图
function clickCapturePic() {
    var re = false;
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        var szChannelID = winsChannels[g_iWndIndex],
            szPicName = (oWndInfo.szIP + "_" + oWndInfo.iChannelID + "_" + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss")).replace(/:/g, "-"),
            iRet = WebVideoCtrl.I_CapturePic(szPicName);
        if (0 == iRet) {//抓图成功
            re = true;
        }
    }
    if (re) {
        popup("抓图成功！", 2 * 1000);
    } else {
        popup("抓图失败！", 2 * 1000);
    }
}

// 设置音量(暂废弃)
function clickSetVolume(volume, winId) {
    if (!winId) {
        winId = g_iWndIndex;
    }
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId),
        iVolume = parseInt(volume, 10);

    if (oWndInfo != null) {
        WebVideoCtrl.I_SetVolume(iVolume);//返回0设置成功
    }
}

/**********************************对讲，录制***************************************/
// 获取对讲通道
function clickGetAudioInfo() {
    var szIP = "192.168.12.83:8081";//$("#ip").val();
    if ("" == szIP) {
        return;
    }

    WebVideoCtrl.I_GetAudioInfo(szIP, {
        success: function (xmlDoc) {
            var oAudioChannels = $(xmlDoc).find("TwoWayAudioChannel"),
                oSel = $("#audioChannels").empty();
            $.each(oAudioChannels, function () {
                var id = $(this).find("id").eq(0).text();
                oSel.append("<option value='" + id + "'>" + id + "</option>");
            });
        },
        error: function () {
            //showOPInfo(szIP + " 获取对讲通道失败！");
        }
    });
}

// 开始对讲
function clickStartVoiceTalk(winId) {
    if (!winId) {
        winId = g_iWndIndex;
    }
    var camera = winsCameras[winId];
    if (!camera) {
        alert("该窗口现无视频播放，请先打开。");
        return;
    }
    var szIP = setIP(camera.streamUrl, camera.httpPort);
    if ("" == szIP) {
        return;
    }

    if (!hasAuth) {
        popup("对不起，该用户没有控制权限", 1.5 * 1000);
        return;
    }
    if (!winsTalk[winId]) {//如果不在对讲中，就开启对讲
        //先获取对讲通道
        WebVideoCtrl.I_GetAudioInfo(szIP, {
            success: function (xmlDoc) {
                var oAudioChannels = $(xmlDoc).find("TwoWayAudioChannel");
                var oSel = $("#audioChannels").empty();
                $.each(oAudioChannels, function () {
                    var id = $(this).find("id").eq(0).text();
                    oSel.append("<option value='" + id + "'>" + id + "</option>");
                });

                var iAudioChannel = parseInt($("#audioChannels").val(), 10);//默认使用第一个通道
                if (isNaN(iAudioChannel)) {
                    alert("对讲通道设置有误！");
                    return;
                }

                //开始对讲
                var iRet = WebVideoCtrl.I_StartVoiceTalk(szIP, iAudioChannel);
                if (iRet == 0) {
                    winsTalk[winId] = true;
                } else {
                    winsTalk[winId] = false;
                }
                showDoing(winId);
            },
            error: function () {
                //showOPInfo(szIP + " 获取对讲通道失败！");
                alert("对不起，该设备没有对讲功能！");
            }
        });
    }
}

// 停止对讲
function clickStopVoiceTalk(winId) {
    if (!winId) {
        winId = g_iWndIndex;
    }
    if (winsTalk[winId]) {//如果正在对讲中，才关闭对讲
        var iRet = WebVideoCtrl.I_StopVoiceTalk();
        if (iRet == 0) {
            winsTalk[winId] = null;
            showDoing(winId);
        }
    }
}

// 开始录像
function clickStartRecord(winId) {
    if (!winId) {
        winId = g_iWndIndex;
    }
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId);
    if (!oWndInfo) {
        alert("该窗口现无视频播放，请先打开。");
        return;
    }
    if (!winsRecord[winId]) {//未在录制中
        //clickGetLocalCfg();
        var recordPath = $("#recordPath").val();//获取路径
        if (recordPath) {
            var szChannelID = winsChannels[winId] || 1,
                szFileName = (oWndInfo.szIP + "_" + szChannelID + "_" + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss")).replace(/:/g, "-");//文件名称
            var iRet = WebVideoCtrl.I_StartRecord(szFileName);//返回0成功
            if (iRet == 0) {
                winsRecord[winId] = true;
            } else {
                winsRecord[winId] = false;
            }
            showDoing(winId);
        } else {
            alert("抱歉，录像文件保存路径暂未设置，请先进行设置");
            clickOpenFileDlg('recordPath', 0);
            if ($("#recordPath").val()) {
                clickStartRecord();
            }
        }
    }
}

// 停止录像
function clickStopRecord(winId) {
    if (!winId) {
        winId = g_iWndIndex;
    }
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId);
    if (oWndInfo != null) {
        if (winsRecord[winId]) {//正在录制中，就停止
            var iRet = WebVideoCtrl.I_StopRecord();
            if (iRet == 0) {//返回0成功
                winsRecord[winId] = null;
                showDoing(winId);
            }
        }
    }
}

/**
 * 设置窗口是否在录制中或对讲中的提示信息
 * @param winId
 */
function showDoing(winId) {
    $("#showDoing").html("");
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId);
    if (null != oWndInfo) {
        if (winsTalk[winId]) {
            $("#showDoing").append("<span style='color: #ffffff;'>对讲中…</span>");
        } else if (false == winsTalk[winId]) {
            $("#showDoing").append("<span style='color: #ffffff;'>对讲失败…</span>");
        }
        if (winsRecord[winId]) {
            $("#showDoing").append("<span style='color: #ffffff;'>录制中…</span>");
        } else if (false == winsRecord[winId]) {
            $("#showDoing").append("<span style='color: #ffffff;'>录制失败…</span>");
        }
    }
}
/**********************************对讲，录像 end***********************************/

//获取视频设备
function getCameraDevices() {
    var url = "/ajax/station/camera/getCamerasByLandId";
    var params = {
        landId: landId,
        moduleId: moduleId,
        ts: new Date().getTime()
    };
    getCameras(url, params);
}

//视频中心页面获取视频设备
function getCameraDevicesForCenter() {
    var url = "/station/camera/ajax/getCamerasByStationId";
    var params = {
        stationId: stationId,
        ts: new Date().getTime()
    };
    getCameras(url, params);
}

//从数据库获取数据
function getCameras(url, params) {
    $.ajax({
        url: url,
        data: params,
        type: "get",
        dataType: "json",
        success: function (data) {
            var container = $("#channelList");
            if (data.code == 200) {
                YLoad.start();//正在加载提示信息显示
                cameraList = data.result;
                loadCameras();
            } else {
                container.html('<h3 class="text-danger" style="margin:10px 10px;text-align: center;color:#ffffff;">' + data.msg + '</h3>');
                $("#loginCamera").append("<option value=''>请选择设备</option>");
            }
        }
    });
}


//===================================新的处理方案2015-10-22=================================
//解析视频设备列表
function loadCameras() {
    //清空视频控制选项卡中的视频设备列表
    $("#cameraList").html("");
    //清空视频回放选项卡中的已登录录像机下拉框
    $("#loginCamera").empty();
    $("#loginCamera").append("<option value=''>请选择设备</option>");

    if (null != cameraList) {
        cameraSum = cameraList.length;//设置设备的数量
        setCameraList();//加载视频列表
        //加载完后的处理
        isOk = true;
        if (controlOrLoop == "control") {//如果是在控制选项卡
            setWndNum();//设置窗口分割数
        }
        //设置滚动条
        $('#channelList ul').height(88).rollbar({zIndex: 10, pathPadding: 2, blockGlobalScroll: !0});
    }
}

//加载视频控制选项卡中视频设备列表，视频回放选项卡中录像机下拉框
function setCameraList() {
    var NVRList = Array();//保存网络录像机
    var NVRNum = 0;//保存网络录像机数量
    var autoPlay;
    for (var i = 0; i < cameraList.length; i++) {
        var camera = cameraList[i];
        var deviceName = cutStr(camera.deviceName, 0, 6);
        var li = $('<li onclick="cameraClick(this);">').data("camera", camera);//.attr("channelId", camera.channel).attr("cameraType", camera.cameraType);
        if(camera.autoPlay){autoPlay = li;}
        if (camera.cameraType == 1) {//球机
            li.addClass("mode2");
        }
        li.append('<a href="javascript:void(0)" title="' + camera.deviceName + '">' + deviceName +
        '<i id="' + camera.deviceId + '_' + camera.channel + '" class="wait" title="' + waitTitle + '"></i></a>');
        $("#cameraList").append(li);

        if (camera.deviceStyle == 1) {//是录像机,判断是否已存在
            var ipStr = setIP(camera.streamUrl, camera.httpPort);
            //if (null == NVRList[ipStr]) {//不存在就添加
            //NVRList[ipStr] = camera.httpPort;
            //如果是网络录像机，则向选项卡2的下拉框添加一个设备
            //var option = $("<option value='" + ipStr + "'>网络录像机" + (++NVRNum) + "</option>").data("camera", camera);
            var option = $("<option value='" + ipStr + "'>" + deviceName + "</option>").data("camera", camera);
            $("#loginCamera").append(option);
            //}
        }
    }
    if(autoPlay){cameraClick(autoPlay[0]);}
}

//点击视频设备开始预览
function cameraClick(obj) {
    if (!isOk) {
        if (!confirm("视频设备未全部加载完成，是否仍继续（不推荐）？")) {
            return;
        }
    }
    var state = $(obj).find("i").attr("class");
    //if (state == "fail") {
    //    alert('抱歉，本设备不可读取，请检查网络与设备的状态是否正常！');
    //    return;
    //}
    if (state == "loading") {
        alert('本设备正在登录中，请稍后！');
        return;
    }

    var camera = $(obj).data("camera");
    var channelId = camera.channel;
    var key = camera.deviceId + "_" + channelId;
    if (null != camerasWinIds[key] && undefined != camerasWinIds[key]) {
        alert("该视频已在" + (parseInt(camerasWinIds[key], 10) + 1) + "号窗口打开！");
        return;
    }
    var iObj = $(obj).find("i").eq(0);
    changeState(iObj, null);//登录中

    try {
        //var iRets = WebVideoCtrl.I_Logout(camera.streamUrl + ":" + camera.httpPort);
        var iRet = WebVideoCtrl.I_Login(setIP(camera.streamUrl, camera.httpPort), 1, camera.httpPort, camera.username, camera.pwd, {
            success: function (xmlDoc) {//登录成功
                setTimeout(function () {
                    startPlay(camera, obj);
                }, 1000);
            },
            error: function () {//登录失败
                changeState(iObj, failCode, camera.device.deviceName);
            }
        });
        if (-1 == iRet) {//已登录
            setTimeout(function () {
                startPlay(camera, obj);
            }, 1000);
        }
    } catch (e) {
        changeState(iObj, failCode, camera.deviceName);
    }
}

//开始预览
function startPlay(camera, obj) {
    // 开始预览
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szIP = setIP(camera.streamUrl, camera.httpPort),
        iStreamType = parseInt(_currStreamType, 10),
        iChannelID = camera.channel || 1,
        bZeroChannel = false;
    if (iStreamType == 0) {//用户未手动切换过码流，就用后台配置的默认的
        iStreamType = camera.streamType;
    }
    $("#streamType").val(streamType[iStreamType]);
    $("#streamTypeSel li").removeClass("active");
    $('#streamTypeSel li[value="' + iStreamType + '"]').addClass("active");
    if ("" == szIP) {
        return;
    }
    if (oWndInfo != null) {// 已经在播放了，先停止
        stopOne(g_iWndIndex);
    }
    var iRet = WebVideoCtrl.I_StartRealPlay(szIP, {
        iStreamType: iStreamType,
        iChannelID: iChannelID,
        bZeroChannel: bZeroChannel
    });
    var iObj = $(obj).find("i").eq(0);
    winStreamType[g_iWndIndex] = iStreamType;//保存该窗口清晰度
    if (0 == iRet) {//预览成功
        $(obj).attr('winId', g_iWndIndex);
        winsCameras[g_iWndIndex] = camera;//保存窗口对应的视频设备信息
        var key = camera.deviceId + "_" + iChannelID;
        camerasWinIds[key] = g_iWndIndex;//保存已打开的视频设备对应的窗口编号
        openWinIds += g_iWndIndex + ",";//保存已打开的视频窗口编号
        winsChannels[g_iWndIndex] = iChannelID;//保存窗口对应的通道号
        winsCameraTypes[g_iWndIndex] = camera.cameraType;//保存窗口对应的类型（球机或枪机）
        changeState(iObj, playCode);
        if (isCenter) {//视频中心
            //getPresetsForCenter();//查找预置点
        } else {
            //getPreset(null);//获取预置点
        }
    } else {
        changeState(iObj, failCode, camera.device.deviceName);
    }
}

//===================================新方案end==============================================

//解析完设备列表，设置窗口分割数
function setWndNum() {
    //判断当前总视频数量,并更改窗口布局（1x1,2x2,3x3,4x4）
    if (cameraSum <= 1) {
        changeWndNum(1);
    } else if (cameraSum <= 4) {
        changeWndNum(2);
    } else if (cameraSum <= 9) {
        changeWndNum(3);
    } else {
        changeWndNum(4);
    }
}

//窗口分割数，同时设置图标选中的样式
function changeWndNum(iType) {
    iType = parseInt(iType, 10);
    maxWinId = iType * iType;//设置最大的窗口数
    $("#splitWins a, #splitWins div").each(function () {
        $(this).removeClass("active");
    });
    $("#splitWins a, #splitWins div").eq(iType - 1).addClass("active");
    WebVideoCtrl.I_ChangeWndNum(iType);
}

/**
 * 改变视频列表的状态
 * @param obj 页面中设备状态的容器对象或者窗口编号
 * @param state 需要改成的状态(0：待机，1：播放，-1：失败)
 * @param deviceName 设备名称
 */
function changeState(obj, state, deviceName) {
    if (typeof (obj) == "object") {
        obj = $(obj);
    } else {
        obj = $("li[winId='" + obj + "']").find("i").eq(0);
    }
    if (state == waitCode) {//待机状态
        obj.removeAttr("class").attr("class", "wait").attr("title", waitTitle);
    } else if (state == playCode) {//播放状态
        obj.removeAttr("class").attr("class", "play").attr("title", playTitle);
    } else if (state == failCode) {//失败状态
        obj.removeAttr("class").attr("class", "fail").attr("title", failTitle);
        if (null == deviceName || undefined == deviceName || "" == deviceName) {
            deviceName = "本设备";
        }
        alert("抱歉，" + deviceName + "不可读取，请检查网络与设备的状态是否正常！");
    } else {
        obj.removeAttr("class").attr("class", "loading").attr("title", loadTitle);
    }
}

// PTZ控制 9为自动，1,2,3,4,5,6,7,8为方向PTZ
var g_bPTZAuto = false;
function mouseDownPTZControl(iPTZIndex) {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        bZeroChannel = false,
        iPTZSpeed = $("#ptzspeed").val(),
        bStop = false;
    if (bZeroChannel) {// 零通道不支持云台
        return;
    }

    if (oWndInfo != null) {
        if (!hasAuth) {
            popup("对不起，该用户没有控制权限", 1.5 * 1000);
            return;
        }
        if (9 == iPTZIndex && g_bPTZAuto) {
            iPTZSpeed = 0;// 自动开启后，速度置为0可以关闭自动
            bStop = true;
        } else {
            g_bPTZAuto = false;// 点击其他方向，自动肯定会被关闭
            bStop = false;
        }

        WebVideoCtrl.I_PTZControl(iPTZIndex, bStop, {
            iPTZSpeed: iPTZSpeed,
            success: function (xmlDoc) {
                if (9 == iPTZIndex) {
                    g_bPTZAuto = !g_bPTZAuto;
                }
            },
            error: function () {
            }
        });
    }
}

// 方向PTZ停止
function mouseUpPTZControl() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(1, true, {
            success: function (xmlDoc) {//停止云台成功
            },
            error: function () {
            }
        });
    }
}

//画面放大（变倍+）
function PTZZoomIn() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        if (!hasAuth) {
            popup("对不起，该用户没有控制权限", 1.5 * 1000);
            return;
        }
        WebVideoCtrl.I_PTZControl(10, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//调焦+成功
            },
            error: function () {
            }
        });
    }
}

//画面放大（变倍-）
function PTZZoomout() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        if (!hasAuth) {
            popup("对不起，该用户没有控制权限", 1.5 * 1000);
            return;
        }
        WebVideoCtrl.I_PTZControl(11, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//调焦-成功
            },
            error: function () {
            }
        });
    }
}

//变倍停止
function PTZZoomStop() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(11, true, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//调焦停止成功
            },
            error: function () {
            }
        });
    }
}

// 打开声音
function clickOpenSound() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        var allWndInfo = WebVideoCtrl.I_GetWindowStatus();
        // 循环遍历所有窗口，如果有窗口打开了声音，先关闭
        for (var i = 0, iLen = allWndInfo.length; i < iLen; i++) {
            oWndInfo = allWndInfo[i];
            if (oWndInfo.bSound) {
                WebVideoCtrl.I_CloseSound(oWndInfo.iIndex);
                break;
            }
        }

        var iRet = WebVideoCtrl.I_OpenSound();

        if (0 == iRet) {//打开声音成功
        } else {
        }
    }
}

// 关闭声音
function clickCloseSound() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_CloseSound();
        if (0 == iRet) {//关闭声音成功
        } else {
        }
    }
}

//停止一个窗口预览
function stopOne(winId) {
    winId = parseInt(winId);
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId);
    if (oWndInfo != null) {
        clickStopVoiceTalk(winId);//停止对讲
        clickStopRecord(winId);//停止录像
        var iRet = WebVideoCtrl.I_Stop(winId);
        if (0 == iRet) {//停止预览成功
            //现将当前窗口播放中的设备状态变为待机
            var liObj = $("li[winId='" + winId + "']");
            if (liObj.find("i").attr("class").indexOf("play") >= 0) {
                changeState(liObj.find("i"), waitCode);
                var cam = liObj.data("camera");
                var k = cam.deviceId + "_" + cam.channel;
                //删除原来视频设备打开对应的窗口号
                delete camerasWinIds[k];//= null;
            }
            $("li[winId='" + winId + "']").removeAttr("winId");

            winStreamType[winId] = null;//winStreamType = winStreamType.splice(winId, 1);//删除当前窗口对应的清晰度
            winsCameras[winId] = null;//winsCameras.splice(winId, 1);//删除当前窗口对应的视频设备信息
            //delete camerasWinIds[k];//删除当前设备对应的窗口号
            openWinIds = openWinIds.replace("," + winId + ",", ",");//删除当前打开的窗口号
            winsChannels[winId] = null;//winsChannels.splice(winId, 1);//删除当前窗口对应的通道号
            winsCameraTypes[winId] = null;//winsCameraTypes.splice(winId, 1);//删除当前窗口对应的摄像头类型
            //winsPresetIds[winId] = null;//winsPresetIds.splice(winId, 1);//删除当前窗口对应的预置点id

            $(".new_pos_pot").hide();//隐藏添加预置点按钮
            //清空预置点列表
            var obj = $("#presetList");
            var content = obj.find(".rollbar-content");
            content.empty();
            //obj.height(presetLineHeight);
            content.height(presetLineHeight);
        }
    }
}

// 停止全部预览
function stopAll() {
    if (maxWinId == "" || maxWinId == null) {
        maxWinId = 16;
    }
    for (var i = 0; i < maxWinId; i++) {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(i);
        if (oWndInfo != null) {
            clickStopVoiceTalk(i);//停止对讲
            clickStopRecord(i);//停止录像
            var iRet = WebVideoCtrl.I_Stop(i);
            if (0 == iRet) {//停止预览成功
            } else {
            }
        }
    }
    winStreamType.length = 0;//清空各窗口对应的清晰度
    winsCameras.length = 0;//清空各窗口对应的视频设备信息
    camerasWinIds = Array();//清空设备对应的窗口号
    openWinIds = ",";//清空已打开的窗口号
    winsChannels.length = 0;//清空窗口对应的通道号
    winsCameraTypes.length = 0;//清空窗口对应的摄像头类型
    //winsPresetIds.length = 0;//清空各窗口对应的预置点id
    $("#cameraList li").each(function () {//改变正在播放视频的样式
        var state = $(this).find("i").attr("class");
        //现将当前窗口播放中的列表状态变为待机
        if (state.indexOf("play") >= 0) {
            changeState($(this).find("i"), waitCode);
        }
        $(this).removeAttr("winId");
    });

    $(".new_pos_pot").hide();//隐藏添加预置点按钮
    //清空预置点列表
    var obj = $("#presetList");
    var content = obj.find(".rollbar-content");
    content.empty();
    //obj.height(presetLineHeight);
    content.height(presetLineHeight);

    $("#searchList li").each(function () {//改变录像列表的样式
        $(this).removeClass("activ");
        $(this).removeAttr("winId");
    });
}

/**********************************预置点begin***********************************/
//获取预置点
function getPreset(flag) {
    var obj = $("#presetList");
    var content = obj.find(".rollbar-content");
    content.empty();//请空预置点列表
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {//判断窗口是否在播放
        //获取窗口对应的设备信息
        var camera = winsCameras[g_iWndIndex];//$("li[winId='"+g_iWndIndex+"']").eq(0).data("camera");
        if (null != camera) {
            if (winsCameraTypes[g_iWndIndex] == 1) {//球机
                $(".new_pos_pot").show();//显示添加预置点按钮
                //获取球机摄像头下的预置点列表
                $.ajax({
                    type: "post",
                    url: "/ajax/station/preset/getPreset",
                    data: {
                        cameraId: camera.deviceId,
                        channelId: winsChannels[g_iWndIndex],
                        landId: landId,
                        moduleId: moduleId
                    },
                    dataType: "json",
                    success: function (data) {
                        if (data.code != 200) {
                            content.html('<h3 style="text-align: center;color:#000;">' + data.msg + '</h3>');
                            //obj.height(presetLineHeight);
                            content.height(presetLineHeight);
                            content.css("top", "0px");
                            obj.find(".rollbar-handle").animate({top: 0}, 100);
                            return;
                        }
                        //解析预置点列表
                        var presetList = data.result;
                        //var ul = $("<ul>");
                        for (var i = 0; i < presetList.length; i++) {
                            var preset = presetList[i];
                            //预置点名称
                            var presetName = cutStr(preset.presetName, 0, 7);
                            //绑定的设备名称
                            var deviceName = cutStr(preset.deviceName, 0, 11);
                            var li = $("<li>").addClass("pos-item");
                            //预置点名称
                            li.append('<span class="pos_pot_name"><input type="text" value="' + presetName + '" title="' + preset.presetName + '" disabled="disabled" readonly></span>');
                            //绑定的设备名称
                            li.append('<span class="pos_pot_target" title="' + preset.deviceName + '">' + deviceName + '</span>');
                            //删除按钮
                            li.append('<span class="pos_pot_delete perm_del" title="删除" onclick="delPreset(' + preset.presetId + ');"></span>');
                            //转到预置点按钮
                            var runClass = "pos_pot_run";
                            //if (preset.presetId == winsPresetIds[g_iWndIndex]) {
                            //    runClass = "pos_pot_run on";
                            //}
                            li.append('<span title="预置点" id="preset' + preset.presetId + '" class="' + runClass +
                            '" onclick="callPreset(null, ' + preset.presetPoint + ', this);"></span>');
                            li.appendTo(content);
                        }
                        //obj.height(Math.min(presetConHeight, presetLineHeight * obj.find('li').length));
                        if (null == flag) {
                            content.height(presetLineHeight * obj.find('li').length);
                        } else if ("del" == flag) {
                            content.height(presetLineHeight * obj.find('li').length).css('top', Math.min(parseInt(content.css('top')) + presetLineHeight, 0));
                        } else if ("add" == flag) {
                            content.height(presetLineHeight * obj.find('li').length).css('top', Math.min(-((presetList.length - 7) * presetLineHeight + 17), 0));
                        }
                        if (content.height() < presetConHeight) {
                            content.css("top", "0px");//把预置点列表拉到最上面，否则当内容较少时，会被隐藏在上面
                        }
                    }
                });

            } else {//枪机
                $(".new_pos_pot").hide();//.attr("style", "display:none");//隐藏添加预置点按钮
                content.html('<h3 style="text-align: center;color:#000;">无此功能</h3>');
                //obj.height(presetLineHeight);
                content.height(presetLineHeight);
                content.css("top", "0px");
                obj.find(".rollbar-handle").animate({top: 0}, 100);
            }
        }
    } else {
        $(".new_pos_pot").hide();//.attr("style", "display:none");//隐藏添加预置点按钮
        //obj.height(presetLineHeight);
        content.height(presetLineHeight);
        content.css("top", "0px");
        obj.find(".rollbar-handle").animate({top: 0}, 100);
    }
}

//视频中心页面获取预置点
function getPresetsForCenter() {
    var obj = $("#presetList");
    var content = obj.find(".rollbar-content");
    content.empty();//请空预置点列表
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {//判断窗口是否在播放
        //获取窗口对应的设备信息
        var camera = winsCameras[g_iWndIndex];//$("li[winId='"+g_iWndIndex+"']").eq(0).data("camera");
        if (null != camera) {
            if (winsCameraTypes[g_iWndIndex] == 1) {//球机
                //获取球机摄像头下的预置点列表
                $.ajax({
                    type: "post",
                    url: "/station/preset/ajax/listPresetsForCenter",
                    data: {
                        cameraId: camera.deviceId,
                        channelId: winsChannels[g_iWndIndex],
                        stationId: stationId
                    },
                    dataType: "json",
                    success: function (data) {
                        if (data.code != 200) {
                            content.html('<h3 style="text-align: center;color:#000;">' + data.msg + '</h3>');
                            content.height(presetLineHeight);
                            content.css("top", "0px");
                            obj.find(".rollbar-handle").animate({top: 0}, 100);
                            return;
                        }
                        //解析预置点列表
                        var presetList = data.result;
                        for (var i = 0; i < presetList.length; i++) {
                            var preset = presetList[i];
                            //预置点名称
                            var presetName = cutStr(preset.presetName, 0, 7);
                            //绑定的设备名称
                            var deviceName = cutStr(preset.deviceName, 0, 11);
                            var li = $("<li>").addClass("pos-item");
                            //预置点名称
                            li.append('<span class="pos_pot_name"><input type="text" value="' + presetName + '" title="' + preset.presetName + '" disabled="disabled" readonly></span>');
                            //绑定的设备名称
                            li.append('<span class="pos_pot_target" title="' + preset.deviceName + '">' + deviceName + '</span>');
                            //转到预置点按钮
                            var runClass = "pos_pot_run";
                            li.append('<span title="预置点" id="preset' + preset.presetId + '" class="' + runClass +
                            '" onclick="callPreset(null, ' + preset.presetPoint + ', this);"></span>');
                            li.appendTo(content);
                        }
                        content.height(presetLineHeight * obj.find('li').length);
                        if (content.height() < presetConHeight) {
                            content.css("top", "0px");//把预置点列表拉到最上面，否则当内容较少时，会被隐藏在上面
                        }
                    }
                });

            } else {//枪机
                content.html('<h3 style="text-align: center;color:#000;">无此功能</h3>');
                content.height(presetLineHeight);
                content.css("top", "0px");
                obj.find(".rollbar-handle").animate({top: 0}, 100);
            }
        }
    } else {
        content.height(presetLineHeight);
        content.css("top", "0px");
        obj.find(".rollbar-handle").animate({top: 0}, 100);
    }
}

//添加预置点按钮
var clickNum = 0;
function addPreset(appType) {
    clickNum++;
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {//判断窗口是否在播放
        var obj = $("#presetList");
        var content = obj.find('.rollbar-content');
        var presetSize = obj.find('.pos-item').length;
        if (presetSize >= 16) {
            alert("对不起，预置点已达上限个数，不可继续添加！");
            return;
        }
        obj.find('h3').remove();
        var li = $("<li>").addClass("pos-item");
        var span = $('<span class="pos_pot_name"></span>').appendTo(li);
        var input = $('<input type="text" placeholder="预置点名称">');
        input.appendTo(span);
        //var select = $("<select>").addClass('pos_pot_target').append('<option value="0">请选择</option>');
        //for (var i = 0; i < sensorList.length; i++) {//地块下的传感器设备
        //    var sensor = sensorList[i];
        //    var sensorName = cutStr(sensor.deviceName, 0, 7);
        //    select.append('<option value="' + sensor.deviceId + '" title="' + sensor.deviceName + '">' + sensorName + '</option>')
        //}
        //if (appType == 1) {//设施农业
        //    for (var i = 0; i < ctrlList.length; i++) {//地块下的控制设备
        //        var ctrl = ctrlList[i];
        //        var ctrlName = cutStr(ctrl.deviceName, 0, 7);
        //        select.append('<option value="' + ctrl.deviceId + '" title="' + ctrl.deviceName + '">' + ctrlName + '</option>')
        //    }
        //}
        var select = $('<div class="selects" id="deviceSelect' + clickNum + '"></div>');
        var selectDiv = $('<div class="name-input"></div>');
        var selectInput = $('<input class="name-input" readonly="readonly" type="text" value="请选择" data-value="0">');
        selectDiv.append(selectInput);
        //selectDiv.append('<i class="dx"><img class="ff3" src="/images/xlb.png"></i>');
        select.append(selectDiv);
        var ul = $('<ul style="display: none;width: 117px;"></ul>');
        ul.append('<li value="0">请选择</li>');
        for (var i = 0; i < sensorList.length; i++) {//地块下的传感器设备
            var sensor = sensorList[i];
            var sensorName = cutStr(sensor.deviceName, 0, 7);
            ul.append('<li value="' + sensor.deviceId + '" title="' + sensor.deviceName + '">' + sensorName + '</li>');
        }
        if (appType == 1) {//设施农业
            for (var i = 0; i < ctrlList.length; i++) {//地块下的控制设备
                var ctrl = ctrlList[i];
                var ctrlName = cutStr(ctrl.deviceName, 0, 7);
                ul.append('<li value="' + ctrl.deviceId + '" title="' + ctrl.deviceName + '">' + ctrlName + '</li>');
            }
        }
        select.append(ul);
        li.append(select);
        var spanSave = $('<span class="pos_pot_save perm_edit" title="保存"></span>');
        spanSave.appendTo(li);
        spanSave.on("click", function () {
            savePreset(input.val(), selectInput.attr("data-value"));
        });
        var spanCancel = $('<span class="pos_pot_cancel" title="取消"></span>');
        spanCancel.appendTo(li);
        spanCancel.on('click', function () {//绑定取消事件
            li.remove();//移除一行
            var liSize = obj.find('.pos-item').length;//获取行数
            if (liSize > 0) {
                //obj.height(Math.min(presetConHeight, presetLineHeight * liSize));
                content.height(presetLineHeight * liSize).css('top', Math.min(parseInt(content.css('top')) + presetLineHeight, 0));
                if (content.height() < presetConHeight) {
                    content.animate({top: 0}, 200);
                    obj.find(".rollbar-handle").animate({top: 0}, 200);
                }
            } else {
                content.html('<h3 style="text-align: center;color:#000;">暂无预置点！</h3>');
                //obj.height(presetLineHeight);
                content.height(presetLineHeight);
                content.css("top", "0px");
            }
        });
        li.appendTo(content);

        //obj.height(200);
        if (presetSize > 5) {
            content.height(presetLineHeight * obj.find('.pos-item').length);
            content.css("top", -((presetSize - 6) * presetLineHeight + 17));
            obj.find(".rollbar-handle").animate({top: 137}, 200);
        } else {
            content.height(200);
        }
        $("#deviceSelect" + clickNum).select({liClickDefault: true, auto: true});//给下拉框绑定事件
    } else {
        alert("请先播放一个视频设备！");
    }
}

//保存预置点到数据库
function savePreset(presetName, bindDeviceId) {
    var cameraId = winsCameras[g_iWndIndex].deviceId;
    var channelId = winsChannels[g_iWndIndex];
    $.ajax({
        type: "post",
        url: "/ajax/station/preset/savePreset",
        data: {
            cameraId: cameraId,
            channel: channelId,
            presetName: presetName,
            bindDeviceId: bindDeviceId
        },
        dataType: "json",
        success: function (data) {
            if (data.code == 200) {
                setPreset(data.result);
            } else {
                alert(data.msg);
            }
        }
    });
}

//设置预置点到摄像头
function setPreset(preset) {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        iPresetID = parseInt(preset.presetPoint, 10);
    if (oWndInfo != null) {
        WebVideoCtrl.I_SetPreset(iPresetID, {
            success: function (xmlDoc) {
                alert("添加预置点成功！");
                getSensorDevices();//刷新传感器列表
                getPreset("add");
            },
            error: function () {
                del(preset.presetId, "set");//删除数据库中已保存的预置点
                alert("添加预置点失败！");
            }
        });
    }
}

//删除预置点
function delPreset(presetId) {
    if (confirm("确定删除吗？")) {
        del(presetId, "del");
    }
}

//从数据库中删除预置点
function del(presetId, flag) {
    $.ajax({
        type: "post",
        url: "/ajax/station/preset/delPreset",
        data: {
            presetId: presetId
        },
        dataType: "json",
        success: function (data) {
            if ("del" == flag) {
                alert(data.msg);
                if (data.code == 200) {
                    getSensorDevices();//刷新传感器列表
                    getPreset("del");
                }
            }
        }
    });
}

/**
 * 点击预置点列表调用预置点
 * @param winId 需调用的窗口编号，当为null，默认为当前选中的窗口
 * @param presetPoint 预置点编号
 * @param obj 被点击的对象（通过点击预置点列表）
 * @param presetId 预置点编号（通过设备调用）
 */
function callPreset(winId, presetPoint, obj, presetId) {
    if (null == winId) {
        winId = g_iWndIndex;
    }
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId),
        iPresetID = parseInt(presetPoint, 10);
    if (oWndInfo != null) {
        WebVideoCtrl.I_GoPreset(iPresetID, {
            iWndIndex: winId,
            success: function (xmlDoc) {
                if (obj == null) {
                    obj = $("#preset" + presetId);
                }
                $(obj).parent().parent().find("li .pos_pot_run").each(function () {
                    $(this).removeClass("on");
                });
                $(obj).addClass("on");
                //winsPresetIds[g_iWndIndex] = presetId;//保存窗口对应的预置点编号
            },
            error: function () {
            }
        });
    }
}

/**
 * 调用设备绑定的预置点列表
 * @param bindPresets 绑定的预置点列表
 */
var undoPresets = Array();
function callPresets(bindPresets) {
    undoPresets = Array();
    for (var i = 0; i < bindPresets.length; i++) {
        var preset = bindPresets[i];
        var key = preset.deviceId + "_" + preset.channel;
        if (undefined != camerasWinIds[key] && null != camerasWinIds[key]) {//如果绑定的视频设备已打开，直接调用预置点
            //deviceCallPreset(camerasWinIds[key], preset);
            callPreset(camerasWinIds[key], parseInt(preset.presetPoint, 10), null, preset.presetId);//调用预置点
        } else {
            undoPresets.push(preset);//保存预置点绑定的视频设备未被打开的预置点
        }
    }
    //查找还未打开的窗口编号
    unOpenWinIds = ",";
    for (var i = 0; i < maxWinId; i++) {
        if (openWinIds.indexOf("," + i + ",") < 0) {
            unOpenWinIds += i + ",";
        }
    }
    dealUndoPreset(0);
}

/**
 * 处理未打开的预置点
 * @param idx
 */
function dealUndoPreset(idx) {
    if (idx >= undoPresets.length) {
        return;
    }
    //处理还未调用的预置点
    //for (var i = 0; i < undoPresets.length; i++) {
    if (unOpenWinIds.length > 1) {
        var winId = unOpenWinIds.split(",")[1];
        var result = deviceCallPreset(winId, idx);
        //if (result) {//如窗口打开成功，就从未打开的列表中移除
        //    unOpenWinIds = unOpenWinIds.replace("," + winId + ",", ",");
        //}
    }
    //}
}

/**
 * 设备调用预置点
 * @param winId 窗口id
 * @param presetPoint 预置点编号
 * @param presetId 预置点id
 */
function deviceCallPreset(winId, idx) {
    winId = parseInt(winId);
    var preset = undoPresets[idx];
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId),
        iPresetID = parseInt(preset.presetPoint, 10);
    var isGetPreset = false;
    if (oWndInfo == null && winId == g_iWndIndex) {//当窗口未打开视频且之后或打开，需要获取预置点
        isGetPreset = true;
    }
    if (oWndInfo != null) {//判断窗口是否已打开
        callPreset(winId, iPresetID, null, preset.presetId);//调用预置点
        dealUndoPreset(++idx);
    } else {
        var obj = $("#" + preset.deviceId + "_" + preset.channel);
        var camera = obj.parent().parent().data("camera");
        if (null != camera) {
            if (obj.attr("class") == "fail") {
                alert("抱歉，" + camera.device.deviceName + "不可读取，请检查网络与设备的状态是否正常！");
                dealUndoPreset(++idx);
                return
            }
            changeState(obj, null);//显示登录中
            //先登录该设备
            try {
                var iRet = WebVideoCtrl.I_Login(setIP(camera.streamUrl, camera.httpPort), 1, camera.httpPort, camera.username, camera.pwd, {
                    success: function (xmlDoc) {//登录成功
                        callUnopenCameraPreset(winId, preset, isGetPreset);
                        dealUndoPreset(++idx);
                    },
                    error: function () {//登录失败
                        changeState(obj, failCode, camera.device.deviceName);
                    }
                });
                if (-1 == iRet) {//已登录
                    callUnopenCameraPreset(winId, preset, isGetPreset);
                    dealUndoPreset(++idx);
                }
            } catch (e) {
                changeState(obj, failCode, camera.device.deviceName);
            }
        }
    }
}

/**
 * 调用还未打开的视频的预置点
 */
function callUnopenCameraPreset(winId, preset, isGetPreset) {
    var obj = $("#" + preset.deviceId + "_" + preset.channel);
    var camera = obj.parent().parent().data("camera");
    var iStreamType = parseInt(_currStreamType, 10);//获取清晰度
    if (iStreamType == 0) {//用户未手动切换过码流，就用后台配置的默认的
        iStreamType = camera.streamType;
    }
    var szIp = setIP(preset.streamUrl, camera.httpPort);
    if (null != szIp && "" != szIp) {
        var iRet = WebVideoCtrl.I_StartRealPlay(szIp, {
            iWndIndex: winId,
            iStreamType: iStreamType,
            iChannelID: preset.channel,
            bZeroChannel: false
        });
        winStreamType[winId] = iStreamType;//保存该窗口清晰度
        if (0 == iRet) {//预览成功
            winsCameras[winId] = preset;//保存窗口对应的视频设备信息
            var key = preset.deviceId + "_" + preset.channel;
            camerasWinIds[key] = winId;//保存已打开的视频设备对应的窗口编号
            openWinIds += winId + ",";//保存已打开的视频窗口编号
            winsChannels[winId] = preset.channel;//保存窗口对应的通道号
            winsCameraTypes[winId] = camera.cameraType;//保存窗口对应的类型（球机或别的）
            obj.parent().parent().attr("winId", winId);
            obj.removeAttr("class").attr("class", "play").attr("title", playTitle);//改变设备状态
            unOpenWinIds = unOpenWinIds.replace("," + winId + ",", ",");

            if (isGetPreset) {
                //获取选中窗口的预置点列表
                getPreset(null);//获取当前激活窗口的预置点
            }
            var iPresetID = parseInt(preset.presetPoint, 10);
            callPreset(winId, iPresetID, null, preset.presetId);
            //getPreset(null);//获取预置点
        } else {
            obj.removeAttr("class").attr("class", "fail").attr("title", failTitle);//改变设备状态
        }
    }
}

/**********************************预置点end***********************************/


/*****************************************************视频回放部分**********************************************/
// 搜索录像
var iSearchTimes = 0;
function videoSearch(iType) {
    var ipval = $("#loginCamera").val();
    if (ipval == "" || ipval == null) {
        alert("请先选择一个设备，再进行搜索！");
        return;
    }
    if (!isOk && iType == 0) {
        if (!confirm("视频设备未全部加载完成，是否仍继续（不推荐）？")) {
            return;
        }
    }
    if ($("#cLogin").css("display") != "none") {
        alert("正在搜索，请稍等！");
        return;
    }
    var camera = $("#loginCamera option:selected").data("camera");
    $("#cLogin").show();
    $("#loginCamera").attr("disabled", "true");
    $("#searchList").html("");
    //先登录
    try {
        var szIp = setIP(camera.streamUrl, camera.httpPort);
        var iRets = WebVideoCtrl.I_Logout(szIp);//确保设备未登录过
        var iRet = WebVideoCtrl.I_Login(szIp, 1, camera.httpPort, camera.username, camera.pwd, {
            success: function (xmlDoc) {//登录成功
                if (0 == iType) {// 首次搜索
                    stopAll();
                    $("#videoFiles").height(isCenter ? 275 : 240).rollbar({
                        zIndex: 10,
                        pathPadding: '2px',
                        blockGlobalScroll: !0
                    });
                    //$("#videoFiles .rollbar-content").html('<table id="searchList" style="margin-right: 15px;"></table>');
                    $("#videoFiles .rollbar-content").html('<ul id="searchList"></ul>');
                    iSearchTimes = 0;
                }
                $("#cLogin").hide();
                $("#loginCamera").attr("disabled", false);
                searchBack(camera);
            },
            error: function () {//登录失败
                $("#cLogin").hide();
                $("#loginCamera").attr("disabled", false);
                $("#searchList").html("连接设备失败");
                alert('抱歉，本设备不可读取，请检查网络与设备的状态是否正常！');
            }
        });
        if (-1 == iRet) {//已登录
            $("#cLogin").hide();
            $("#loginCamera").attr("disabled", false);
            searchBack(camera);
        }
    } catch (e) {
        $("#cLogin").hide();
        $("#loginCamera").attr("disabled", false);
        $("#searchList").html("连接设备失败");
        alert('抱歉，本设备不可读取，请检查网络与设备的状态是否正常！');
    }
}

/**
 * 搜索回放录像
 */
function searchBack(camera) {
    var startTime = $("#startTime").val();// + " 00:00:00",// 00:00:00
    var endTime = $("#endTime").val();// + " 23:59:59";// 23:59:59
    if (startTime == "" || endTime == "" || startTime > endTime) {
        alert("请选择正确的起止时间!");
        return;
    }
    startTime += " 00:00:00";
    endTime += " 23:59:59";
    var szIP = setIP(camera.streamUrl, camera.httpPort),
        iChannelID = camera.channel || 1,
        bZeroChannel = false;

    if (bZeroChannel) {// 零通道不支持录像搜索
        return;
    }
    WebVideoCtrl.I_RecordSearch(szIP, iChannelID, startTime, endTime, {
        iSearchPos: iSearchTimes * 40,
        success: function (xmlDoc) {
            if ("MORE" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
                for (var i = 0, nLen = $(xmlDoc).find("searchMatchItem").length; i < nLen; i++) {
                    var szPlaybackURI = $(xmlDoc).find("playbackURI").eq(i).text();
                    if (szPlaybackURI.indexOf("name=") < 0) {
                        break;
                    }
                    var szStartTime = $(xmlDoc).find("startTime").eq(i).text();
                    szStartTime = (szStartTime.replace("T", " ")).replace("Z", "");
                    var szEndTime = $(xmlDoc).find("endTime").eq(i).text();
                    szEndTime = (szEndTime.replace("T", " ")).replace("Z", "");
                    var szFileName = szPlaybackURI.substring(szPlaybackURI.indexOf("name=") + 5, szPlaybackURI.indexOf("&size="));

                    var liId = iSearchTimes * 40 + i + 1;
                    var li = $("<li></li>").attr("id", "id" + liId);
                    li.append('<span class="xh">' + liId + ':</span>');
                    var title = szStartTime + "至" + szEndTime;
                    li.append("<span class='name' title='" + title + "' onclick='clickPlayback(\"" + szIP + "\", " + iChannelID + ", \"" + szStartTime + "\", \"" + szEndTime + "\", " + liId + ");'>" + title + "</span>");
                    //li.append("<span class='plays' onclick='clickPlayback(\"" + szIP + "\", \"" + szStartTime + "\", \"" + szEndTime + "\", " + liId + ");'></span>");
                    li.append("<span><a href='javascript:void(0);' onclick='startDownloadRecord(\"" + szIP + "\", " + iChannelID + ", \"" + szStartTime + "\", " + liId + ");'>下载</a></span>");
                    li.append('<div style="clear:both;"></div>');
                    $("#searchList").append(li);
                    $("#id" + liId).data("playbackURI", szPlaybackURI);
                }
                iSearchTimes++;
                searchBack(camera);// 继续搜索
            } else if ("OK" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
                var iLength = $(xmlDoc).find("searchMatchItem").length;
                for (var i = 0; i < iLength; i++) {
                    var szPlaybackURI = $(xmlDoc).find("playbackURI").eq(i).text();
                    if (szPlaybackURI.indexOf("name=") < 0) {
                        break;
                    }
                    var szStartTime = $(xmlDoc).find("startTime").eq(i).text();
                    szStartTime = (szStartTime.replace("T", " ")).replace("Z", "");
                    var szEndTime = $(xmlDoc).find("endTime").eq(i).text();
                    szEndTime = (szEndTime.replace("T", " ")).replace("Z", "");
                    var szFileName = szPlaybackURI.substring(szPlaybackURI.indexOf("name=") + 5, szPlaybackURI.indexOf("&size="));

                    var liId = iSearchTimes * 40 + i + 1;
                    var li = $("<li></li>").attr("id", "id" + liId);
                    li.append('<span class="xh">' + liId + ':</span>');
                    var title = szStartTime + "至" + szEndTime;
                    li.append("<span class='name' title='" + title + "' onclick='clickPlayback(\"" + szIP + "\", " + iChannelID + ", \"" + szStartTime + "\", \"" + szEndTime + "\", " + liId + ");'>" + title + "</span>");
                    //li.append("<span class='plays' onclick='clickPlayback(\"" + szIP + "\", \"" + szStartTime + "\", \"" + szEndTime + "\", " + liId + ");'></span>");
                    li.append("<span><a href='javascript:void(0);' onclick='startDownloadRecord(\"" + szIP + "\", " + iChannelID + ", \"" + szStartTime + "\"," + liId + ");'>下载</a></span>");
                    li.append('<div style="clear:both;"></div>');
                    $("#searchList").append(li);
                    $("#id" + liId).data("playbackURI", szPlaybackURI);
                }
            } else if ("NO MATCHES" === $(xmlDoc).find("responseStatusStrg").eq(0).text() && iSearchTimes == 0) {
                setTimeout(function () {
                    $("#searchList").html("没有录像文件");
                }, 50);
            }
        },
        error: function () {
            $("#searchList").html("搜索录像文件失败");
        }
    });
}

/**
 * 播放按钮
 */
function startPlayback() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        if (oWndInfo.iPlayStatus == 2) {//正在播放，就暂停
            WebVideoCtrl.I_Pause();
            $(".play-control").find("a").eq(0).attr("class", "vv-play").attr("title", "播放");
        } else if (oWndInfo.iPlayStatus == 3) {//暂停，就恢复播放
            WebVideoCtrl.I_Resume();
            $(".play-control").find("a").eq(0).attr("class", "vv-pause").attr("title", "暂停");
        }
    } else {//开始播放所选择录像机的时间段内所有的录像
        var ipval = $("#loginCamera").val();
        if (ipval == "" || ipval == null) {
            alert("请先选择一个设备进行搜索！");
            return;
        }
        if (!isOk) {
            if (!confirm("视频设备未全部加载完成，是否仍继续（不推荐）？")) {
                return;
            }
        }
        if ($("#searchList li").length <= 0) {
            alert("没有可播放的录像，请先搜索！");
            return;
        }
        var camera = $("#loginCamera option:selected").data("camera");
        var szIP = setIP(ipval, camera.httpPort),
            bZeroChannel = false,
            iChannelID = camera.channel || 1,
            szStartTime = $("#startTime").val() + " 00:00:00",// 00:00:00
            szEndTime = $("#endTime").val() + " 23:59:59",// 23:59:59
        //bChecked = $("#transstream").prop("checked"),
            iRet = -1;
        if (bZeroChannel) {// 零通道不支持回放
            return;
        }

        iRet = WebVideoCtrl.I_StartPlayback(szIP, {
            iChannelID: iChannelID,
            szStartTime: szStartTime,
            szEndTime: szEndTime
        });

        if (0 == iRet) {//开始回放成功
            $(".play-control").find("a").eq(0).attr("class", "vv-pause").attr("title", "暂停");
        } else {
            alert("播放失败");
        }
    }
}

/**
 * 点击录像列表进行播放
 * @param ip
 * @param channel 通道号
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param trId 哪一条录像文件
 */
function clickPlayback(ip, channel, startTime, endTime, trId) {
    if (ip == null || ip == "" || "" == startTime || "" == endTime) {
        alert("播放失败！");
        return;
    }
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        //已经在播放了，就停止原来的
        WebVideoCtrl.I_Stop();
    }
    //设置原来录像列表的样式
    $("#searchList li[winId='" + g_iWndIndex + "']").removeClass("activ");
    $("#searchList li[winId='" + g_iWndIndex + "']").removeAttr("winId");
    var iRet = -1;
    iRet = WebVideoCtrl.I_StartPlayback(ip, {
        iChannelID: channel,
        szStartTime: startTime,
        szEndTime: endTime
    });
    if (0 == iRet) {
        $("#id" + trId).attr("winId", g_iWndIndex);
        $("#id" + trId).addClass("activ");
        $(".play-control").find("a").eq(0).attr("class", "vv-pause").attr("title", "暂停");
    } else {
        alert("播放失败！");
    }
}

/**
 * 停止回放
 */
function closeOne() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        //已经在播放了，就停止，同时设置原来录像列表的样式
        WebVideoCtrl.I_Stop();
        $("#searchList li[winId='" + g_iWndIndex + "']").removeClass("activ");
        $("#searchList li[winId='" + g_iWndIndex + "']").removeAttr("winId");
    }
}

// 暂停
function clickPause() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_Pause();
        if (0 == iRet) {//暂停成功
        } else {
        }
    }
}

/**
 * 播放下一个
 */
function nextOne() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (null == oWndInfo) {//窗口未打开，直接查找未播放的视频
        $("#searchList").find("li").each(function () {
            var winId = $(this).attr("winId");
            if (undefined == winId) {
                $(this).find(".name").eq(0).click();
                return false;
            }
        });
    } else {//窗口已有视频在播放，就先关闭原来的，再查找该视频下面未播放的视频
        var trSize = $("#searchList li[winId='" + g_iWndIndex + "']").nextAll().length;
        if (trSize == 0) {
            alert("不好意思，没有下一个了！");
            return;
        }
        var num = 0;//当前播放视频后面已播放的视频数量
        $("#searchList li[winId='" + g_iWndIndex + "']").nextAll().each(function () {
            var winId = $(this).attr("winId");
            if (undefined == winId) {
                closeOne();//先关闭当前窗口打开的视频
                var obj = $(this);
                setTimeout(function () {
                    obj.find(".name").eq(0).click();
                }, 200);
                return false;
            } else {
                num++;
            }
            if (num == trSize) {
                alert("不好意思，没有下一个了！");
            }
        });
    }
}

/**
 * 快进按钮
 */
function playFast() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_PlayFast();
        if (0 == iRet) {//快放成功
        } else {
        }
    }
}

// 下载录像
var iDownloadID = -1;
var tDownloadProcess = 0;
function startDownloadRecord(ip, channel, startTime, i) {
    //clickGetLocalCfg();
    $nowPath = $("#downloadPath").val();
    if ($nowPath == "" || $nowPath == null) {
        if (confirm("抱歉，视频文件保存路径暂未设置，请先进行设置")) {
            clickOpenFileDlg('downloadPath', 0);
            if ($("#downloadPath").val()) {
                startDownloadRecord(ip, channel, i);
            }
        }
    } else {
        var szIP = ip,
            szFileName = (szIP + "_" + channel + "_" + startTime).replace(/:/g, "-"),
            szPlaybackURI = $("#id" + i).data("playbackURI");
        if ("" == szIP) {
            return;
        }

        iDownloadID = WebVideoCtrl.I_StartDownloadRecord(szIP, szPlaybackURI, szFileName);
        if (iDownloadID < 0) {
            var iErrorValue = WebVideoCtrl.I_GetLastError();
            if (34 == iErrorValue) {
                popup(szIP + " 已下载！");
            } else if (33 == iErrorValue) {
                if (confirm(szIP + " 空间不足，是否更改路径？")) {
                    clickOpenFileDlg('downloadPath', 0);
                    startDownloadRecord(ip, i);
                }
            } else {
                popup(szIP + " 下载失败！");
            }
        } else {
            $("<div id='downProcess' class='freeze'></div>").appendTo("body");
            //回放录像下载进度浮层大小
            var downWidth = 280;
            var downHeight = 260;
            if (isCenter) {
                downHeight = 300;
            }
            tDownloadProcess = setInterval("downProcess(" + downWidth + "," + downHeight + "," + i + ")", 1000);
        }
    }
}

// 下载进度
function downProcess(downWidth, downHeight) {
    var topWidth = parseInt($("#videoFiles .rollbar-content").css("top").replace("px", ""));
    var iStatus = WebVideoCtrl.I_GetDownloadStatus(iDownloadID);
    if (0 == iStatus) {
        $("#downProcess").css({
            position: "absolute",
            "background": '#ddd',
            filter: "alpha(opacity = 50)",
            "-moz-opacity": 0.5,
            "-khtml-opacity": 0.5,
            opacity: 0.5,
            "z-index": 9999,
            width: downWidth + "px",
            height: downHeight + "px",
            "text-align": "center",
            "line-height": downHeight + "px",
            "font-size": "14px",
            "font-weight": "bold",
            "color": "red",
            "over-flow": "hidden",

            left: ($("#searchList").offset().left - 10) + "px",
            top: ($("#searchList").offset().top - 10 - topWidth) + "px"
        });
        var iProcess = WebVideoCtrl.I_GetDownloadProgress(iDownloadID);
        if (iProcess < 0) {
            clearInterval(tDownloadProcess);
            tDownloadProcess = 0;
        } else if (iProcess < 100) {
            $("#downProcess").text(iProcess + "%");
        } else {
            $("#downProcess").text("100%");
            setTimeout(function () {
                $("#downProcess").remove();
            }, 1000);

            WebVideoCtrl.I_StopDownloadRecord(iDownloadID);

            popup("录像下载完成!");
            clearInterval(tDownloadProcess);
            tDownloadProcess = 0;
        }
    } else {
        WebVideoCtrl.I_StopDownloadRecord(iDownloadID);
        clearInterval(tDownloadProcess);
        tDownloadProcess = 0;
        iDownloadID = -1;
    }
}

// 格式化时间
function dateFormat(oDate, fmt) {
    var o = {
        "M+": oDate.getMonth() + 1, //月份
        "d+": oDate.getDate(), //日
        "h+": oDate.getHours(), //小时
        "m+": oDate.getMinutes(), //分
        "s+": oDate.getSeconds(), //秒
        "q+": Math.floor((oDate.getMonth() + 3) / 3), //季度
        "S": oDate.getMilliseconds()//毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}