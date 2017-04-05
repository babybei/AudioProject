$(function (){	
	$.yyting={
		reg:{
			email:/^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
			password:/^\w{6,20}$/,
			idcard:/^\d{15}$|^\d{17}(?:\d|x|X)$/
		},
		localStorage:function(key,val){
			if($.browser.msie&&parseInt($.browser.version)<8){
				if(arguments.length==2){
					if(key=='user'){
						$.cookie('cover',JSON.parse(val).cover);
					}
					$.cookie(key,val,{expires: 30,path:'/'});
				}else{
					if(key=='user'||key=='player-info'){
						var val=$.cookie(key);
						if(val){
							val=val.replace(/{/g,'').replace(/}/g,'');
							var obj={};
							var arr=val.split(',');
							for(var i=0;i<arr.length;i++){
								var temp=arr[i].replace(/:/,',');
								var splitArr=temp.split(',');
								if(splitArr){
									obj[splitArr[0]]=splitArr[1]||'';
								}
							}
							if(key=='user'){
								obj.cover=$.cookie('cover');
							}
							return JSON.stringify(obj);
						}else{
							return val;
						}
					}else{
						return $.cookie(key);
					}
				}
			}else{
				if(arguments.length==2){
					localStorage.setItem(key,val);
				}else{
					return localStorage.getItem(key);
				}
			}
		},
		parseURL:function (path){
			var result = {}, param = /([^?=&]+)=([^&]+)/ig, match;
			while (( match = param.exec(path)) != null) {
				result[match[1]] = match[2];
			}
			return result;
		}
	};	
	
	var playerEvent={
		timer:null,
		data:{},
		init:function(){
			var self=this;
			if($.browser.msie){
				if(location.href.indexOf('/playlist')>-1){
					setInterval(function(){
						var request=$.yyting.localStorage('request');
						if(request&&self.data.request!=request){
							self.data.request=request;
							self.request();
						}
						var response=$.yyting.localStorage('response');
						if(response&&self.data.response!=response){
							self.data.response=response;
							self.response();
						}
						
					},300);
				}else{
					setInterval(function(){
						var exist=$.yyting.localStorage('exist');
						if(exist&&self.data.exist!=exist){
							self.data.exist=exist;
							self.exist();
						}
					},300)
				}
			}else{
				window.addEventListener('storage',function(l){
					if(self[l.key]){
						self[l.key].apply(self,arguments);
					}
				},false);
			}
		},
		exist:function(){
			this.isopen=true;
			var self=this;
			if(this.timer){
				clearTimeout(this.timer);
			}
			this.timer=setTimeout(function(){
				self.isopen=false;
			},1000);
		},
		response:function(l){
			if(!window.audio){
				
				this.playTips();
				//console.log('已经开始播放了。。。');
			}
		},
		request:function(){
			if(window.audio){
				//console.log('响应播放了。。。');
				$.yyting.localStorage('response',this.getRandom());
				this.play();
			}
		},
		play:function(){
			if(window.audio){
				window.player.toPlay();
			}
		},
		getRandom:function(){
			return Math.ceil(Math.random()*100000);
		},
		poll:function(){
			var self=this;
			this.interval=setInterval(function(){
				var response=$.yyting.localStorage('response');
				if(self.data.response!=response){
					self.data.response=response;
					self.response();
				}
			},100);
			setTimeout(function(){
				if(self.interval){
					clearInterval(self.interval);
				}
			},450)
		},
		playTips:function(text){
			if(!this.target){
				return;
			}
			var text=text||'已经开始播放...';
			var $this=$(this.target);
			var tips=$('<div class="play-tips g-auto-hide"><p>'+text+'</p></div>').show();
			$('body').append(tips);
			var top=$this.offset().top-tips.height()-5;
			tips.css({
				left:$this.offset().left,
				top:top
			});
			setTimeout(function(){
				tips.animate({top:top-40,opacity:0},400,function(){
					tips.remove();
				});
			},200);
			this.target=null;
		}
	}
	playerEvent.init();
});