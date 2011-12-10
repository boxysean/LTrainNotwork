
var nowjs = require("now");
var _ = require('./node_modules/underscore/underscore');

(function() {
	
	MissedConnection = function(server,database) {

		var everyone = nowjs.initialize(server);
		var users = {};
		var room = {};
		var public_transcript = [];
		var private_room ={};
		
		
		(function init(){


			nowjs.on('connect', function() {
				everyone.count(function (ct) {
				 total_user = ct;
				});
				this.now.connected();
				everyone.now.getTotalPublicChatUser(total_user);
			});


			nowjs.on('disconnect', function() {
				var current_id = this.user.clientId;
				var total_user = '';
				var disconnect_user = 
				_.select(users, function(user){
					return user.socket_id == current_id;
				})
				if(disconnect_user[0]){
					delete room[disconnect_user[0].user_id];
					delete users[disconnect_user[0].user_id];
					everyone.now.updateRoomList(room);
				}
				everyone.count(function (ct) {
				 total_user = ct;
				});
					
				everyone.now.getTotalPublicChatUser(total_user);
			});


			
			everyone.now.syncUserId = function(id){
				if(users[id]){
					var total_user = '';
					users[id].socket_id = this.user.clientId;	
					users[id].private_chat = true;	
					this.user.username = users[id].username;
					this.user.id = id;
				}else{
					nowjs.getClient( this.user.clientId, function () {
						this.now.chatSessionExpired();
						everyone.now.updateRoomList(room);
					});
				}
				
				
			};
			
			everyone.now.notifyRoomUpdate = function(){
				everyone.now.updateRoomList(room);
			};
			
			everyone.now.enablePrivateChatSetting = function(user_id, enable){
				if(enable){
					 room[user_id] = users[user_id];
					 users[user_id].private_chat = true;	
				}else{
					delete room[user_id];
					users[user_id].private_chat = false;	
				};
				everyone.now.updateRoomList(room);
			}
			
			everyone.now.changeRoom = function(new_room){
				
				var current_id = this.user.clientId;
				var has_user = 
				_.select(users, function(user){
					return user.socket_id == current_id;
				})
				
				if(has_user[0]){
					var prev_room = this.now.server_room;
					var total = '';
					var public_transcript_length = public_transcript.length;
					var transcript = '';

					var publicRoom = nowjs.getGroup(new_room);
	
					publicRoom.addUser(this.user.clientId);
					
					if(public_transcript_length){
						transcript = public_transcript.join('');
						nowjs.getClient( this.user.clientId, function () {
							this.now.retrivePastChat(transcript);	
						});
					}
					
					publicRoom.on('leave', function () {
						var total ='';
						publicRoom.count(function (ct) {
							total = ct;
						});
						publicRoom.now.roomMessage(total);
					});
					
					publicRoom.count(function (ct) {
						total = ct;
					});
					publicRoom.now.roomMessage(total);

					this.now.server_room = new_room;

				}
				else{
					nowjs.getClient( this.user.clientId, function () {
						this.now.chatSessionExpired();
					});
				}
			};
			
			
			
			everyone.now.requestChat = function(requester, receiver, name){
				if(users[receiver] && users[requester.user_id]){
					if(users[receiver].private_chat){
						nowjs.getClient( users[receiver].socket_id, function () {
						  this.now.notifyRequest(requester);
						});
					}
					else{
						var msg = users[receiver].username +" is not available for private chat.";
						nowjs.getClient( users[requester.user_id].socket_id, function () {
							this.now.notifyFailedRequest(msg);
						});
					}	
				}else{
					if(users[requester.user_id]){
						nowjs.getClient( users[requester.user_id].socket_id, function () {
						  var msg = name + " is no longer on missed-connections.";
						  this.now.notifyFailedRequest(msg);
						});
					}else{
						nowjs.getClient( this.user.clientId, function () {
							this.now.chatSessionExpired();
						});
					}
				}
			};
			
			everyone.now.createPrivateChat = function(requester, receiver){
				
					var new_room = requester +'@'+ receiver;
					var newGroup = nowjs.getGroup(new_room);
					newGroup.addUser(this.user.clientId);
					newGroup.addUser(users[requester].socket_id);
					this.now.server_room = new_room;
					nowjs.getClient( users[requester].socket_id, function () {
					  this.now.requestSuccess(new_room);
					});
					
					newGroup.on('leave', function () {
					  	newGroup.now.roomPrivateMessage(this.user.username +" has left the chat room.");
					});
					
					updatePrivateRoom(requester,receiver);
			};
			
			everyone.now.confirmedPrivateChat = function(new_room){
				this.now.server_room = new_room;
				//nowjs.getGroup(new_room).now.roomPrivateMessage(this.now.name, ' has joined the room');

			};

			everyone.now.ignorePrivateChat = function(requester){
				var msg = this.user.username +" does not want to chat with you.";
				nowjs.getClient( users[requester].socket_id, function () {
				  this.now.notifyFailedRequest(msg);
				});
			};
			
			everyone.now.distributeMessage = function(message){
				var group = nowjs.getGroup(this.now.server_room),
					msg = '';
				group.now.receiveMessage(this.now.name, message);
				public_transcript.push("<li>" + this.now.name + ": " + message +"</li>");
				if(public_transcript.length > 6) {
					public_transcript = public_transcript.slice(1,7);
				}
				database.logChat(this.user.id, 'public', message);
			};


			everyone.now.leavePrivateChat = function(id){
				var group = nowjs.getGroup(this.now.server_room);
				group.removeUser(this.user.clientId);
				removePrivateRoom(id);
			}
			
			everyone.now.distributePrivateMessage = function(message){
				var group = nowjs.getGroup(this.now.server_room);
				group.now.receivePrivateMessage(this.now.name, message);
				database.logChat(this.user.id, this.now.server_room, message);
			};
			
		})();
		
		function updatePrivateRoom(){
			var length = arguments.length;
			for(i=0; i< length; i++){
				private_room[arguments[i]] = room[arguments[i]];
				delete room[arguments[i]];
			}
			everyone.now.updateRoomList(room);
		}
		
		function removePrivateRoom(id){
			room[id] =  private_room[id]; 
			delete private_room[id];
			everyone.now.updateRoomList(room);
		}
		

		function generateDummyUser(user){
			//generate fake users
			for(i = 1; i < 15 ; i++){
				users[i] = user;
				room[i] = user;
			}
	
		}

		function addUser(user,res){
			if(!users[user.user_id]){
				users[user.user_id] = user;	
				room[user.user_id] = user;
				//generateDummyUser(user);
				everyone.now.room = room;
			}
			res.send(users[user.user_id]);	
		}
		
		function updateProfile(id, profile, res){
			if(users[id]){
				var user = users[id];

				user.avatar = profile.avatar;
				user.age = profile.age;
				user.orientation = profile.orientation, 
				user.gender= profile.gender, 
				user.question= profile.question, 
				user.interested= profile.interested, 
				user.favcake= profile.favcake,
				room[id] = users[id];	
				everyone.now.room = room;
				everyone.now.updateRoomList(room);
				res.send(users[id]);
			}
		}
		
		return {
			addUser:addUser,
			updateProfile:updateProfile			
		}
	};

}());
