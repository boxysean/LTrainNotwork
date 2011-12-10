$(function(){
	
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


		notwork.page = {
			bindEvent:function(){
				window.conductor_user = [];
				
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
				
				
				
				
				$(".conductor-user a").click(function(){
					
					
					var $el= $(this);
					if(!$el.parents("li").hasClass("selected")){
						if(conductor_user.length == 2){
							var removerUser = conductor_user[0];
							conductor_user = conductor_user.slice(1,2);
							$("img[title="+removerUser+"]").parents("li").removeClass("selected");	
						}
						$el.parent().addClass("selected");	
						conductor_user.push($el.children().attr("title"));
					}
					return false;
				});
				
				
				$("#send-action").click(function(){
					if((conductor_user.length != 2)){
						alert("Please pick two characters!");
						return false;
					}
					var url = "/conductor/"+conductor_user[0]+"/"+conductor_user[1]+"/"+ $(".action").val();

					$.ajax({
						type:'POST',
						url: url,
						data: {},
						success: function(data){
							console.log(data);
							if (data=="success"){
								$.mobile.changePage("#message");
								setTimeout(function(){$.mobile.changePage("#action")}, 7000)
								$(".conductor-user li").removeClass("selected");
								conductor_user=[];
							};
						}
					})
				});
				
				
				
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
		
		
	
});
