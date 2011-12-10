 
		window.notwork = {};
		window.utils = {};
		
		
		utils.submitForm = function(el, cb){
			var $el = el,
				$form = $el.parents("form"),
				url = $form.attr("action"),
				is_valid = true,
				data = $form.serialize();
			
			$form.find(".required").each(function(){
				if($(this).val()==''){
					alert("Please insert your "+ $(this).attr("name"));
					$(this).focus();
					is_valid = false;	
					return false;
				}else{
					is_valid = true;	
				}
			});
			
			if(is_valid){
				utils.createCookie("notworkUser",data,14);
				$.ajax({
					type: 'POST',
					url: url,
					data: data,
					success: function(data){
						if(data != "failed"){
							cb(data);
						}
					}

				});
			}
		};
		
		utils.showDialog = function(el){

			var $window = $(window),
				vertical_space = $window.height() - el.height(),
				top = $window.scrollTop() + vertical_space/3,
				left = (screen.width /2 ) - (el.outerWidth()/2);

			el.css({
				"top": $window.scrollTop() - (el.outerHeight() +10), 
				left: left
			  })
			  .show()
			  .animate({
				top: top,
			  }, 150);			
			
		};




		utils.createCookie = function(name,value,days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
			document.cookie = name+"="+value+expires+"; path=/";
		}
		
		utils.readCookie = function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		}
		
		notwork.app = {
			initContentFeed:function(){
				this.contentFeed.init();	
			},
			
			initMissConnection:function(){
				this.missConnection.init();	
			}	
		};
		
		notwork.page = {
			bindEvent:function(){

				$("#agreed-to-term").click(function(){
					 if($(".hide-legal").is(":checked")){
						 utils.createCookie("notworklegal","agreed",14);
					 }
					 $.mobile.changePage("#home");
					 return false;
				});
				
				// for 404 page
				if($("#not-found").length){
					var path = "../img/dirty/",
						random_src = path + Math.floor(Math.random()*8 + 1)+'.jpg',
						$img = $('<img>',{'src':random_src});
						$("#dirty .content").prepend($img);	
						
					$("#user-response button").click(function(){
						utils.submitForm($(this), function(){
							$("#user-response")
								.find("form")
								.parent()
								.hide()
								.next()
								.fadeIn();
						});
						return false;
					});
					
				}
				
				
				//profile links
				$.each($(".profile a"),function(){
					var $el = $(this),
						mail_link =''
						mail_title = "Email myself "+ $el.attr("title"),
						mail_subject = '[ltrainnotwork.com] '+ $el.attr("title"),
						mail_body = '~^*^~%0A%0ASend this article to yourself by entering your email address in the to field above.%0A%0AHit send, and it will show up in your inbox when you connect to the real internet once you get off the train.%0A%0A~^*^~%0A%0A';
						
						mail_body += $el.attr("title") +'%0A%0A'+$el.attr("href");
						mail_body += '%0A%0AThe L Train Notwork is brought to you by http://WeMakeCoolSh.it';
						
						msg_link ='mailto:?subject='+mail_subject+'&body='+mail_body;
						
						$el.attr("href",msg_link); 	
						$el.text(mail_title); 	
				});

				// for contact us Page
				
				$("#contact button").click(function(){
					utils.submitForm($(this), function(){
						$("#contact")
							.find("form")
							.parent()
							.hide()
							.next()
							.fadeIn();
					});
					return false;
				});
				
				$("#contact .back").click(function(){
						//need to figure how to do callback from page change
						setTimeout(function(){
							var $parent = $("#contact"),
								$form = $parent.find("form");
							
								$parent
									.find(".content")
									.show()
									.next()
									.hide();

							$(':input', "form")
								 .not(':button, :submit, :reset')
								 .val('')
								 .removeAttr('checked')
								 .removeAttr('selected');
						},1000);
				});
				
				
			}
		}
		
		notwork.app.contentFeed = (function(){
			
			var content_cache = [];
			
			init = function(){
				getHomeFeed("/featured")
					.then(function(){
						bindEvents();	
						var read_term = utils.readCookie("notworklegal");
						if(read_term =="agreed"){
							$.mobile.changePage("#home");
						}
						else{
							$.mobile.changePage("#landing");
						}
				});
			};

			getHomeFeed = function(url){
				var dfr = $.Deferred(),
					feed = '',
					feed_markup = [],
					featured = '',
					featured_markup = []; 

					
				fetchContent(url)
					.then(function(data){
						
						var featured_content = data.featured_content,
							feeds = data.feeds;

						$.map(featured_content, function(featured, i){
  						  var str = '';
						  str = '<h3><a href="/category/'+ featured.type +'">'+featured.type+'</a></h3><ul class="content-feed-list feed-links">'
						  $.map(featured.contents, function(content, i){
							  content = JSON.parse(content);
							  if(featured.type == "images"){
								  str += '<li><a class="imagefeed" href="/content-feed/id/'+content.content_id+'"><strong>'+content.title+'</strong><p>'+content.description+'</p></a></li>';
							  }else{
								  str += '<li><a href="/content-feed/id/'+content.content_id+'"><strong>'+content.title+'</strong><p>'+content.description+'</p></a></li>';
							  }
						  }); 
						  str += '</ul>';
						  featured_markup.push(str);
						});

							
						$.map(feeds, function(val, i){
  						  var str = '';

						  feed = JSON.parse(val);
						  str = '<h3><a href="/content-feed/id/'+feed.content_id+'">'+feed.title+'</a></h3><ul class="content-feed-list feed-links">'
						  str += '<li><a href="/content-feed/id/'+feed.content_id+'"><u>'+feed.description+'</u></li>';
						  str += '</ul>';
						  feed_markup.push(str);
						});

						$(".featured-content .featured").html(featured_markup.join(''));
						$(".featured-content .feeds").html(feed_markup.join(''));

						return dfr.resolve();
					});	
				return dfr.promise();	
			};


			
			getContentFeed = function(url){
				var dfr = $.Deferred();
				if(content_cache[url]){
					return dfr.resolve(content_cache[url]);
				}
				else{
					fetchContent(url)
						.then(function(data){
							content_cache[url] = data;
							return dfr.resolve(content_cache[url]);
						});	
				}
				return dfr.promise();	
			};
			
			fetchContent = function(url){
				var dfr = $.Deferred();
				$.getJSON(url, function(data){
					return dfr.resolve(data);
				})
				return dfr.promise();	
			};
			

			//somehow i can't use live event on the click, it breaks the changepage...
			bindContentList = function(){
				$(".feed-links li a, .feeds h3 a").unbind().bind("click",function(){
					var $content = $("#content"),
						$el = $(this),
						photos = [],
						markup = '',
						$title = $content.find("h2"),
						url = $(this).attr("href"),
						$content_canvas = $content.find(".content-detail");

					$content_canvas.html('');
					$title.text('');
					
					if($el.hasClass('imagefeed')){
						getContentFeed(url)
							.then(function(data){
									$.each(data.images, function(i,item){
										str = '<li><a href="'+item.image_url+'" rel="external"><img src="'+item.thumbnail+'" alt="'+item.title+'" /></a></li>'
										photos.push(str);
									});
									markup += '<div class="top-text">'+ data.textTop +'</div>';
									markup += '<ul class="gallery">'+photos.join('')+'</ul>';
									markup += '<div class="bottom-text">'+ data.textBottom +'</div>';
									$title.text(data.title);
									$content_canvas.html(markup);
									myPhotoSwipeNew = $("ul.gallery a").photoSwipe();
									$.mobile.changePage("#content");
							  });
					}
					else {
						getContentFeed(url)
							.then(function(data){
								$title.text(data.title);
								$content_canvas.html(data.markup);
								$.mobile.changePage("#content");
							});
					}
					return false;
				});
			};



			bindEvents = function(){
				$(".category-list a, .featured h3 a").click(function(){
					var $el = $(this),
						url = $el.attr("href"),
						title = $el.text(),
						str = [];

					if($el.attr("rel")=="external" || $el.attr("rel")=="internal"){
						return true;	
					}
					
					if(title == "words"){
						$.mobile.changePage("#word-category");
						bindContentList();
						return false;	
					}

					if(title.toLowerCase() == "images"){
						getContentFeed(url)
							.then(function(data){
								var str = [];
								$.map(data, function(content){
									content = JSON.parse(content);
									  str.push('<li><a class="imagefeed" href="/content-feed/id/'+content.content_id+'"><strong>'+content.title+'</strong><p>'+content.description+'</p></a></li>');
								});
								$("#images-category .feed-links").html(str.join(''));
								$.mobile.changePage("#images-category");
								bindContentList();
	
							});
						return false;	
					}

						
					getContentFeed(url)
						.then(function(data){
   						    str.push('<h2>'+title+'</h2><ul class="content-feed-list feed-links">');
							$.map(data, function(content){
								content = JSON.parse(content);
								  if(title == 'Images'){
									  str.push('<li><a class="imagefeed" href="/content-feed/id/'+content.content_id+'"><strong>'+content.title+'</strong><p>'+content.description+'</p></a></li>');
								  }
								  else{
									  str.push('<li><a href="/content-feed/id/'+content.content_id+'"><strong>'+content.title+'</strong><p>'+content.description+'</p></a></li>');
								  }
							});
							str.push('<ul>');
							
							$("#category .category-detail").html(str.join(''));
							
							$.mobile.changePage("#category");
							bindContentList();

						});
					
					return false;
				});
				
				
				bindContentList();

				
				
				
			};
			
			return {
				init:init
			};	
		})();

		notwork.app.missConnection = (function(){
			var current_user = '',
				all_users ='';

			init = function(){
				bindEvent();
				
				if(utils.readCookie("notworkUser")){
					var data = utils.readCookie("notworkUser");
					$.ajax({
						type:'POST',
						url: "/create-chat-user",
						data: data,
						success: function(data){
							if(data != "failed"){
								current_user = data;
								$("#my-profile").html(renderUserList(data,true));
								$.mobile.changePage("#chat-list");
								setupChatList();
							}
						}
					})
				}
			}
			

		
		function renderUserList(user, self){
			var markup_list = [];
			if(self){
				markup_list.push('<span class="left '+ user.avatar +'"></span>');
				markup_list.push('<div class=left">');
				markup_list.push('<span class="name">'+user.username +'<span><br />');
				markup_list.push("I'm a "+user.age+" "+user.orientation+" "+user.gender+". <br />");
				markup_list.push("I'm looking for "+user.interested+" chat. <br />");
				markup_list.push('<a href="#" class="edit-profile">Edit Profile</a>');
			}else{
				markup_list.push('<li><a class="group" data-roomId="'+user.user_id+'" href="#">');
				markup_list.push('<span class="left '+ user.avatar +'"></span>');
				markup_list.push('<div class=left">');
				markup_list.push('<span class="name">'+user.username +'<span><br />');
				markup_list.push("I'm a "+user.age+" "+user.orientation+" "+user.gender+". <br />");
				markup_list.push("I'm looking for "+user.interested+" chat. <br /></div></a></li>");					
			}
			return markup_list.join('');	
		}
		
		


			function bindEvent(){
				
				$("#missed-connection option").each(function(){
					var $el = $(this);
					$el.attr("value",$el.text())
				});
				
				
				$("body").keypress(function(event) {
				  if ( event.which == 13 ) {
					  $("button:visible").trigger("click");
				   }
				});			

				$(".avatar-list a").click(function(){
					var $el = $(this),
						$parent = $(this).parents(".avatar-list");
					
					$parent.find(".selected").removeClass("selected");
					
					$el
						.parent()
						.addClass("selected");
					
					$(".avatar").val($el.attr("class").replace("ui-link",''));
				});				
				
				$(".edit-profile").live("click", function(){
					$("#user-id").val(current_user.user_id);
					$("#age").val(current_user.age);
					$("#orientation").val(current_user.orientation);
					$("#gender").val(current_user.gender);
					$("#question").val(current_user.question);
					$("#interested").val(current_user.interested);
					$("#favcake").val(current_user.favcake);
					$(".avatar").val(current_user.avatar);
					$("#username").val(current_user.username);
					$.mobile.changePage("#edit-profile");
					return false;
				});
		
				$("#missed-connection button").click(function(){
					saveProfile($(this), true);
					return false;
				});

				$("#edit-profile button").click(function(){
					saveProfile($(this), false);
					return false;
				});


				function saveProfile(el,is_new){

					var $parent = el.parents("form");	
					
					$parent.find("select").each(function(){
						
						if($(this).find("option:selected").hasClass("initial")){
							$(this).find("option:selected").attr("selected","");
							$(this).find(".default").attr("selected","selected");	
						}
					});
					
					utils.submitForm(el,function(data){
						current_user = data;
						$("#my-profile").html(renderUserList(data,true));
						$.mobile.changePage("#chat-list");
						if(is_new){
						setupChatList();
						}
					});	
					
				}
				
				$("#user-detail .info a").live("click", function(){
					var room_id = $(this).data().roomid,
						user_name = $("#user-detail h2").text();
					showWaitingDialog(user_name);
					now.requestChat(current_user, room_id, user_name);
					return false;
				});
				
				$(".chat-list a").live("click", function(){
					var room_id = $(this).data().roomid;
					showUserProfile(room_id);
					return false;
				});
				
				$(".open-chat").click(function(){
					$.mobile.changePage("#chat");	
					now.changeRoom('public');	
					return false;
				})
				
			}
			
			function setClientRoomList(roomList){
					var markup_list = [],
						total = 0,
						msg = "No users available for private chat.";
					all_users = roomList;
					for(room in roomList){
						if(roomList[room].user_id != current_user.user_id){
							markup_list.push(renderUserList(roomList[room]));
							total += 1;
						}
					}
						
					if(total == 2){
						msg = 	"User available for private chat."
					}else{
						msg = 	"Users available for private chat."
					}
					$(".total-private-user ").text(msg);
					$(".chat-list").html(markup_list.join(''));
			}
			
			function showUserProfile(id){
				var markup = [],
					user = all_users[id];
				markup.push('<h2>'+user.username+'</h2>');
				markup.push('<span class="'+ user.avatar +'"></span>');
				markup.push('<p>');
				markup.push("I'm a "+user.age+" "+user.orientation+" "+user.gender+". <br />");
				markup.push("I'm looking for "+user.interested+" chat. <br />");
				markup.push("When I say red, I mean "+user.question +".<br />");
				
				if(user.favcake == "the cake is a lie!"){
					markup.push("My favorite sort of cake is "+user.favcake +"<br />");
				}else{
					markup.push("My favorite sort of cake is "+user.favcake +".<br />");
				}
				markup.push('<p><a data-roomId="'+user.user_id+'" href="#">Request Chat</a></p>');
				
				$("#user-detail .info").html(markup.join(''));
				
				$.mobile.changePage("#user-detail");
			}
			
			
			function showWaitingDialog(username){
						var markup = '<div class="waiting dialog"><div class="system-message">'
							markup += 'Waiting response from '+ username  +'...</div>';
						var el = $(markup);	
						$("body").append(el);
						utils.showDialog(el);
			};


			function showSessionEndDialog(msg){
						var markup = '<div class="system dialog"><div class="system-message">'
							markup += 'Your session has expired.<div> <a class="refresh ui-link" href="#">Refresh</a></div></div>';
						var el = $(markup);	
						$("body").append(el);
						utils.showDialog(el);
			};


			
			function clearPrevPrivateChat(){
				$("#private-chat .room-message").text('');
				$("#private-chat .chat-messages").text('');
			}			
			
			
			
			function setupChatList(){
				
				now.name = current_user.username;
				
				now.ready(function(){
					now.syncUserId(current_user.user_id);
					setClientRoomList(now.room);
					setTimeout(now.notifyRoomUpdate,500);

				});
				
				now.updateRoomList = function(room){
					setClientRoomList(room);
				}

				now.notifyRequest = function(requester){
						var markup = '<div class="permission dialog"><div class="system-message">'
							markup += requester.username  +' would like to chat with you</div>'
							markup += '<div data-id='+requester.user_id+' class="action"><a class="accept ui-link" href="#">Accept</a><a class="ignore ui-link" href="#">Ignore</a></div></div>';
						var el = $(markup);	
						$("body").append(el);
						utils.showDialog(el);
				};	
				
				now.notifyFailedRequest = function(msg){
					var markup = '<p>'+msg+'</p><br><a class="close" href="#">close</a>',	
						el = $(".waiting");
					$(".waiting .system-message").html(markup);

				el.css({
					left: (screen.width /2 ) - (el.outerWidth()/2)
				  });

				}
				
				now.updateClientRoomList = function(roomList){
					setClientRoomList(roomList);
				};				
					
				now.retrivePastChat = function(chat){
					var $chat_list = $("#chat .chat-messages");
					if($chat_list.find("li").length < 6){
						$chat_list.html(chat);
					}
				}

				now.receiveMessage = function(name, message){
					$("#chat .chat-messages").append("<li>" + name + ": " + message +"</li>");
				}

				now.roomMessage = function(total){
					var message='You are the only one in this chat room.';
					if(total > 1){
						message='There are '+total+' users in this chat room.';
					}
					$("#chat .room-message").html(message);
				}



				now.receivePrivateMessage = function(name, message){
					$("#private-chat .chat-messages").append("<li>" + name + ": " + message +"</li>");
				}


				now.roomPrivateMessage = function(message){
					$("#private-chat .room-message").append("<p>"+ message +"</p>");
				}
				
				now.requestSuccess = function(room){
					now.confirmedPrivateChat(room);
					$(".waiting").remove();
					clearPrevPrivateChat();
					$.mobile.changePage("#private-chat");	
				}
				
				now.chatSessionExpired = function(){
					showSessionEndDialog()
				}
				
				//now.name = prompt("What's your name?", "");
			}

			
			
			
							// Send message to people in the same group
				$("#chat #send-button").click(function(){
					$chat_msg = $("#chat .message");
					if($chat_msg.val().trim() == ''){
						alert("Please say something.");
						$chat_msg.focus();	
					}else{
					now.distributeMessage($chat_msg.val());
					$chat_msg.val("");
					}
					return false;
				});

				$("#turn-off-private").click(function(){
					if($(this).is(":checked")){
						now.enablePrivateChatSetting(current_user.user_id,false);
					}else{
						now.enablePrivateChatSetting(current_user.user_id, true);
					}	
				})

				$("#private-chat #send-button").click(function(){
					$chat_msg = $("#private-chat .message");
					if($chat_msg.val().trim() == ''){
						alert("Please say something.");
						$chat_msg.focus();	
					}else{
					now.distributePrivateMessage($chat_msg.val());
					$chat_msg.val("");
					}
					return false;
				});


				
				$(".permission .accept").live("click",function(){
					var requester_id = $(this).parents(".action").data().id;
					now.createPrivateChat(requester_id, current_user.user_id);
					$(".permission").remove();
					clearPrevPrivateChat();
					$.mobile.changePage("#private-chat");	
					return false;
				});

				$(".permission .ignore").live("click",function(){
					var requester_id = $(this).parents(".action").data().id;
					now.ignorePrivateChat(requester_id);
					$(".permission").remove();
					return false;
				});


				$(".system .refresh").live("click",function(){
					$.mobile.changePage("#missed-connection");
					$(".system").remove();
					return false;
				});			

				$(".waiting .close").live("click",function(){
					$.mobile.changePage("#chat-list");
					$(".waiting").remove();
					return false;
				});	
				
				$(".leave-chat").click(function(){
					now.leavePrivateChat(current_user.user_id);
					$.mobile.changePage("#chat-list");
				});		
			
			
			return {
				init:init
			};	
		})();		
		
	
 

