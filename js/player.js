$(function() {
	window.player = {
		getSectionInfo : function($dom) {//设置window.ydata信息
			$dom.find('input[type="hidden"]').each(function() {
				var $this = $(this);
				window.ydata[$this.attr('name')] = $this.val();
				if($this.attr('data-href')){
					$('.'+$this.attr('name')).attr('href',$this.attr('data-href'));
				}
			});
			$.yyting.localStorage('player-info', JSON.stringify(window.ydata));
			//没有找到音频的提示
			// if(!window.ydata.source){
			// 	var tips=$('.player-error-tips');
			// 	tips.show();
			// 	setTimeout(function(){
			// 		tips.fadeOut();
			// 		$dom.next().click();
			// 	},5000);
			// }
		},
		init : function() {
			var self = this;
			this.createAudiojs();
			this.addListener();
			//this.currentTimeInterval();
		},
		addListener : function() {//播放器事件监听
			$('#progressSlider').mouseover(function(){
				$('.player-progress-control').css('display','block');
			}).mouseout(function(){
				$('.player-progress-control').css('display','none');
			});
			
			$('#volSlider').mouseover(function(){
				$('#volSlider .ui-slider-handle').css('display','block');
			}).mouseout(function(){
				$('#volSlider .ui-slider-handle').css('display','none');
			});

			var self=this;
			$('.section').on('click', '.section-item', function() {
				var $this = $(this);
				self.getSectionInfo($this);
				if(window.audio&&window.ydata.source){
					window.audio.load(window.ydata.source);
					window.audio.play();
				}
			});
			$('.player-play').on('click', function() {
				window.audio.play();
			});
			$('.player-pause').on('click', function() {
				window.audio.pause();
			});
			$('.player-prev').on('click', function() {
				//加载动画
				$('#play_btn,#push_btn').hide();
				$('#toolAnimation').show();
				setTimeout(function(){
					$('#load_left span').addClass('animationleft');
					$('#load_right span').addClass('animationright');
					setTimeout(function(){
						$('#toolAnimation').hide();
						$('#load_left span').removeClass('animationleft');
						$('#load_right span').removeClass('animationright');
						//加载上一个
						var prev=$('.section div.section-item.active').prev('div.section-item');
						if(prev.length==0){
							$('.section div.section-item:last').click();
						}else{
							prev.click();
						}						
					},500);
				},100);
			});
			$('.player-next').on('click', function() {   //下一个
				//加载动画
				$('#play_btn,#push_btn').hide();
				$('#toolAnimation').show();
				setTimeout(function(){
					$('#load_left span').addClass('animationleft');
					$('#load_right span').addClass('animationright');
					setTimeout(function(){
						$('#toolAnimation').hide();
						$('#load_left span').removeClass('animationleft');
						$('#load_right span').removeClass('animationright');
						//加载下一个
						var next=$('.section div.active').next('div.section-item');
						if(next.length!=0){
							$('.section div.active').next().click();	
						}
						else{
							$('.section div.section-item:first').click();
						}
					},500);
				},100);
			});
			//静音
			$('#volumeWrap a.mute').on('click',function(){
				var vposition = $('#volSlider div.ui-slider-range');
				var vSlider=$("#volSlider a.ui-slider-handle");
				//$(this).addClass('muted').removeClass('mute');
				$(this).hide();
				$('#volumeWrap a.muted').show();
				$('#volumeWrap a.mute').hide();
				vposition.width(0);
				vSlider.css('left', 0);
				window.audio.setVolume(0);
				$.yyting.localStorage('volumeMute', 1);
			});
			//取消静音
			$('#volumeWrap a.muted').on('click',function(){
				$.yyting.localStorage('volumeMute', 0);
				$(this).hide();
				$('#volumeWrap a.mute').show();
				$('#volumeWrap a.muted').hide();
				//设置音量var 
				volume = $.yyting.localStorage('volume')|| this.element.volume;
				window.audio.setVolume(volume);
				//$('.player-volume-position').css('width',parseFloat(volume) * 100 + '%');
				$('#volSlider div.ui-slider-range').css('width',parseFloat(volume) * 100 + '%');
				$('#volSlider a.ui-slider-handle').css('left',parseFloat(volume) * 100 + '%');
			});
			//列表暂停按钮事件
			$('.player-list').on('click',function(e){
				//获得音频路径
				//var source=$(this).parents(".section-item").find('input[name="source"]').val();
				self.getSectionInfo($(this).parents(".section-item"));
				if(window.audio&&window.ydata.source){
					window.audio.load(window.ydata.source);
					window.audio.play();
				}
				e.stopPropagation();
			});
			//列表播放按钮事件
			$('.pause-list').on('click',function(e){
				self.getSectionInfo($(this).parents(".section-item"));
				if(window.audio&&window.ydata.source){
					window.audio.load(window.ydata.source);
					window.audio.pause();
				}
				e.stopPropagation();
			});
			this.progressEvent();
		},
		progressEvent:function(){
			/* 播放进度 */
			var control = $('.player-progress-control');
			var position = $('.player-progress-position');
			var pcontrol = control.parent();
			var initX = 0;
			var positionX = 0;
			this.progressMoveMark = false;
			control.on('mousedown', function(e) {
				initX = e.pageX;
				positionX = control.position().left;
				var left = 0;
				$(document).on('mousemove', function(e) {
					left = positionX + (e.pageX - initX);
					if (left > pcontrol.width()) {
						left = pcontrol.width();
					}
					if (left < 0) {
						left = 0;
					}
					control.css('left', left);
					position.width(left);
					this.progressMoveMark = true;
				}).on('mouseup', function(e) {
					window.audio.skipTo(left / pcontrol.width());
					this.progressMoveMark = false;
					$(document).off('mousemove').off('mouseup');
				});
				e.preventDefault();
			});
			pcontrol.on('click', function(e) {
				if (control[0] != e.target) {
					var left = e.pageX - pcontrol.offset().left;
					control.css('left', left);
					position.width(left);
					window.audio.skipTo(left / pcontrol.width());
				}
			});
			/* 修改音量 */
			var vprogress = $('#volSlider');
			var vposition = $('#volSlider div.ui-slider-range');
			var vSlider=$("#volSlider a.ui-slider-handle");
			var volume =0;
			var volumeInitX = 0;
			var volumePositionX = 0;
			vSlider.on('mousedown', function(e) {
				volumeInitX = e.pageX;
				volumePositionX = vSlider.position().left;
				var left = 0;
				$(document).on('mousemove', function(e) {
					left = volumePositionX + (e.pageX - volumeInitX);
					if (left > vprogress.width()) {
						left = vprogress.width();
					}
					if (left < 0) {
						left = 0;
					}
					vSlider.css('left', left);
					vposition.width(left);
					this.progressMoveMark = true;
					if(left==0){
						$('#volumeWrap a.mute').hide();
						$('#volumeWrap a.muted').show();
						$.yyting.localStorage('volumeMute', 1);					
					}else{
						$('#volumeWrap a.mute').show();
						$('#volumeWrap a.muted').hide();
						$.yyting.localStorage('volumeMute', 0);
					}
				}).on('mouseup', function(e) {
					var volume = parseFloat(left / vprogress.width() * 100) / 100;
					if(volume>1){
						volume=1;
					}
					else if(volume<0){
						volume=0;
					}
					window.audio.setVolume(volume);
					if(volume==0){
						$('#volumeWrap a.muted').show();
						$('#volumeWrap a.mute').hide();
						$.yyting.localStorage('volumeMute', 1);
					}
					else{
						$('#volumeWrap a.mute').show();	
						$('#volumeWrap a.muted').hide();
						$.yyting.localStorage('volumeMute', 0);
					}
					$.yyting.localStorage('volume', volume);
					this.progressMoveMark = false;
					$(document).off('mousemove').off('mouseup');
				});
				e.preventDefault();
			});
			vprogress.on('click', function(e) {
				var left = e.pageX - vprogress.offset().left;
				//防止鼠标点击导致vSlider超出范围
				if(left<0){
					left=0;
				}
				else if(left>104){
					left=104;
				}
				vposition.width(left);
				vSlider.css('left', left);
				var volume = parseFloat(left / vprogress.width() * 100) / 100;
				if(volume>1){
					volume=1;
				}
				else if(volume<0){
					volume=0;
				}
				if(volume==0){
					$('#volumeWrap a.muted').show();
					$('#volumeWrap a.mute').hide();
					$.yyting.localStorage('volumeMute', 1);
				}
				else{
					$('#volumeWrap a.mute').show();	
					$('#volumeWrap a.muted').hide();
					$.yyting.localStorage('volumeMute', 0);
				}
				$.yyting.localStorage('volume', volume);
				window.audio.setVolume(volume);
			});
		},
		createAudiojs : function() {//创建audiojs
			/* 初始化播放器 */
			var self=this;
			var currentTime = $('.player-current-time');
			var durationTime = $('.player-duration-time');
			var progressPosition = $('.player-progress-position');
			var progressControl = $('.player-progress-control');
			var progressLoaded = $('.player-progress-loaded');

			audiojs.events.ready(function() {
				function setProgress(val) {
					if (!self.progressMoveMark) {
						progressControl.css('left', val);
						progressPosition.width(val);
					}
				}
				window.audio = audiojs.createAll({
					loadError : function() {
						if(!window.ydata.ctime){
							window.ydata.ctime=window.ydata.ctime||window.audio.element.currentTime;
							//console.log('window.ydata.ctime:'+window.ydata.ctime);
						}
						if(window.audio&&window.ydata.source){
							window.audio.load(window.ydata.source);
							var isFirst=$('#isFirst');
							if(isFirst.val()==0){
								isFirst.val(1);							
								window.audio.pause();
							}else{
								window.audio.play();
							}
						}
					},
					init:function(){
						//获取是否静音
						if($.yyting.localStorage('volumeMute')==1){
							//$('#volumeWrap a.mute').addClass('muted').removeClass('mute');
							$('#volumeWrap a.mute').hide();
							$('#volumeWrap a.muted').show();
							this.setVolume(0);
							//$('.player-volume-position').css('width',parseFloat(volume) * 100 + '%');
							$('#volSlider div.ui-slider-range').css('width',0);
							$('#volSlider a.ui-slider-handle').css('left',0);	
						}
						else{
							//$('#volumeWrap a.mute').addClass('mute').removeClass('muted');
							$('#volumeWrap a.mute').show();
							$('#volumeWrap a.muted').hide();
							// //解决音频拖到最大时列表播放音频切换音量加载错误问题
							// if(this.element.volume)
							// {
							// 	$.yyting.localStorage('volume',this.element.volume);
							// }

							var volume = $.yyting.localStorage('volume')|| this.element.volume;
							//防止音量超出范围
							if(volume>1){
								volume=1;
							}else if(volume<0){
								volume=0;
							}
							this.setVolume(volume);
							//$('.player-volume-position').css('width',parseFloat(volume) * 100 + '%');
							$('#volSlider div.ui-slider-range').css('width',parseFloat(volume) * 100 + '%');
							$('#volSlider a.ui-slider-handle').css('left',parseFloat(volume) * 100 + '%');							
						}
					},
					loadProgress : function(b) {
						progressLoaded.css('width', b * 100 + '%');
					},
					loadStarted : function() {
						var b = this.settings.createPlayer, c = Math
						.floor(this.duration / 60), d = Math
						.floor(this.duration % 60);
						durationTime.text((c < 10 ? "0" : "") + c + ":"
							+ (d < 10 ? "0" : "") + d);
						if(window.ydata.ctime&&this.duration){
							var time=window.ydata.ctime;
							window.ydata.ctime='';
							//console.log('time:'+time+'/'+this.duration);
							var self=this;
							setTimeout(function(){
								self.skipTo(parseFloat(time)/self.duration);
							},200);
						}
						
					},
					updatePlayhead : function(b) {
						if(b * 100<=100){
							setProgress(b * 100 + '%');
						}
						var c = this.duration * b;
						this.currentTime=c;
						var b = Math.floor(c / 60);
						var c = Math.floor(c % 60);
						currentTime.text((b < 10 ? "0" : "") + b + ":"
							+ (c < 10 ? "0" : "") + c);
					},
					play : function() {    //点击player-play播放音频
						$('#play_btn').hide();
						$('#push_btn').show();
						var sectionItem=$('#section' + window.ydata.sectionid);    //当前播放音乐id
						sectionItem.addClass('active').removeClass('pause').siblings().removeClass('active');   //添加播放样式
						//sectionItem.find('.audio-control').addClass('pause-list').removeClass('player-list');   //列表播放按钮样式
						//sectionItem.siblings().find('.audio-control').removeClass('pause-list').addClass('player-list');    //列表其它播放按钮暂停
						sectionItem.find('.pause-list').show();
						sectionItem.find('.player-list').hide();
						sectionItem.siblings().find('.player-list').show();
						sectionItem.siblings().find('.pause-list').hide();
						//更新播放记录
						// setTimeout(function(){
						// 	self.updateCurrentTime();
						// },1500);
						window.ydata.sections=window.ydata.number;
						$.yyting.localStorage('player-info', JSON.stringify(window.ydata));
					},
					pause : function() {
						$('#play_btn').show();
						$('#push_btn').hide();
						var sectionItem=$('#section' + window.ydata.sectionid);    //当前播放音乐id
						$('.section-item.active').addClass('pause');
						//$('.section-item.active').find('.audio-control').addClass('player-list').removeClass('pause-list');  //列表暂停
						sectionItem.find('.pause-list').hide();
						sectionItem.find('.player-list').show();
						$("#push_btn").hide();
						$("#play_btn").show();
					},
					trackEnded : function() {
						//$('.player-next').click();   //列表循环播放
					},
					css:''
				})[0];	
			});
		},
		toPlay:function(){//播放器开始播放入口
			var self=this;
			var playerInfo=JSON.parse($.yyting.localStorage('player-info'));
			if (!window.ydata) {
				window.ydata = {
						resourcesid:'',
						sections:'',
						type:'',
						ctime:''
				};
			}
			var active = $('.section div.section-item:first');
			self.getSectionInfo(active);
		},
		getAlbumInfo:function(url){//获取专辑或书籍信息
			$.yyting.ajax({
				url:url,
				success:function(data){
					$('.aside-inner').html(data);
				}
			})
		},
		updateCurrentTime:function(callback){//更新播放记录
		},
		currentTimeInterval:function(){//更新播放记录的定时器
			var self=this;
			setTimeout(function(){
				self.updateCurrentTime(function(){
					self.currentTimeInterval();
				});
			},1000*60);
		}
	};
	player.init();
	// if(!$.browser.msie){
		player.toPlay();
	// }
	// if($.browser.msie&&$.browser.version=='7.0'){
	// 	player.toPlay();
	// }
	setInterval(function(){
		$.yyting.localStorage('exist', Math.random()*100000);
	},1000);	
});