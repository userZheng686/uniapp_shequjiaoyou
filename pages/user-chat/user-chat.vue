<template>
	<view>
		<template v-if="list.length > 0">
			<!--聊天列表-->
			<scroll-view scroll-y="true" 
			style="position: absolute;left: 0;top: 0;right: 0;bottom: 100rpx;"
			:scroll-into-view="scrollInto" scroll-with-animation="true">
				<block v-for="(item,index) in list" :key="index" >
					<!--左边-->
					<view :id="'chat'+index">
						<userChatList :item="item" :index="index" :pretime="index > 0 ? list[index-1].create_time : 0"></userChatList>
					</view>
				</block>
			</scroll-view>
		</template>
		<template v-else-if="loading">
			<loading></loading>
		</template>

		<!--底部操作条-->
		<bottomInput @submit="submit"></bottomInput>
		
	</view>
</template>

<script>
	// #ifdef H5
	const ws = new WebSocket('ws://106.12.54.136:8000')
	// #endif
	
	import userChatList from '../../components/user-chat/user-chat-list.vue'
	import bottomInput from '../../components/common/bottom-input.vue'
	
	export default {
		components:{
			userChatList,bottomInput
		},
		data() {
			return {
				scrollInto : "",
				loading : true,
				username : "",
				send_avatar : "",
				reply_avatar: "",
				send_userid : "",
				reply_userid : "",
				list : []
			}
		},
		onLoad(e) {
			let _this = this;
			this.getChatUserInfo(e)
			
			uni.connectSocket({
			  url: 'ws://106.12.54.136:8000'
			});
			
			uni.onSocketOpen(function (res) {
			  console.log('WebSocket连接已打开！');
			});
			
			uni.onSocketError(function (res) {
			  uni.showToast({
			  	title : 'WebSocket连接打开失败，请检查！',
				icon : 'none'
			  })
			});
			uni.onSocketMessage(function (res) {
			  _this.handleWsMessage(res)
			});
			
		},
		mounted(){
			this.pageToBottom()
		},
		methods: {
			getChatUserInfo(e){
				let _this = this;
				let list = uni.getStorageSync('chat')
				list = list[e.index]
				_this.username = list.username
				_this.send_userid = list.send_userid
				_this.reply_userid = list.reply_userid
				_this.send_avatar = list.avatar
				_this.reply_avatar = JSON.parse(uni.getStorageSync('userinfo')).userpic
				uniCloud.callFunction({
					name : 'chat',
					data : {
						action : 'getChatDetail',
						send_userid : _this.send_userid,
						reply_userid : _this.reply_userid
					},
					success(res) {
						res.result.data = res.result.data.map((item) => {
							return {
								user_id : item.send_userid,
								avatar : item.send_userid === uni.getStorageSync('user').id ? _this.reply_avatar : _this.send_avatar,
								data : item.content,
								type : item.type, // image video audio 
								create_time : item.create_time
							}
						})
						_this.list = res.result.data
						_this.loading = false
					},
					fail() {
						_this.loading = false
					}
				})
				
			},
			handleWsMessage(e){
				let list = e.data
				let message = JSON.parse(list).detail
				let index = this.list.findIndex((v) => v.create_time === message.create_time)
				if(index === -1){
					this.list.push(message)
				}
			},
			// 发送
			submit(data){
				let _this = this;
				// list列表
				let send = {
					content: data,
					create_time: new Date().getTime(),
					send_userid: _this.reply_userid === uni.getStorageSync('user').id ? _this.reply_userid : _this.send_userid,
					reply_userid: _this.reply_userid === uni.getStorageSync('user').id ? _this.send_userid : _this.reply_userid,
					type: "text"
				}
				
				uniCloud.callFunction({
					name : 'chat',
					data : {
						action : 'sendChatDetail',
						send
					},
					success(res) {
						// detail列表
						let obj = {
							user_id : uni.getStorageSync('user').id,
							avatar : _this.reply_avatar,
							data : data,
							type : "text", // image video audio 
							create_time : (new Date()).getTime()
						}
						_this.list.push(obj)
						// 滚动到底部
						_this.pageToBottom()
						
						send.username = _this.username;
						send.userpic = _this.reply_avatar;
						
						let message = {
							detail : obj,
							list : send
						}
						uni.sendSocketMessage({
						  data: JSON.stringify(message)
						});
					},
					fail() {
						
					}
				})
				
			},
			// 滚动到底部
			pageToBottom(){ 
				this.$nextTick(function(){
					let lastIndex = this.list.length - 1
					if(lastIndex < 0) return;
					this.scrollInto = 'chat' + lastIndex;
				})
			}
		},
		
	}
</script>

<style>

</style>
