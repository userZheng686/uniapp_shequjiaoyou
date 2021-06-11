<template>
	<view>
		<!--消息列表-->
		<template v-if="list.length > 0">
			<block v-for="(item,index) in list" :key="index">
				<msgList :item="item" :index="index"></msgList>
			</block>
		</template>
		<template v-else-if="loading">
			<loading></loading>
		</template>
		<template v-else>
			<nothing></nothing>
		</template>
		
		<!--弹出层-->
		<uni-popup ref="popup" type="top">
			<view class="w-100" style="background-color: white;">
				<view class="flex align-center justify-center font-md border-bottom py-2" 
				@click="popupEvent('friend')"
				hover-class="bg-light" >
					<text class="iconfont icon-sousuo mr-2"></text> 添加好友
				</view>
				<view class="flex align-center justify-center font-md border-bottom py-2"
				 @click="popupEvent('clear')"
				 hover-class="bg-light">
					<text class="iconfont icon-shanchu mr-2"></text> 清除列表
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	// #ifdef H5
	const ws = new WebSocket('ws://106.12.54.136:8000')
	// #endif
	
	
	
	import uniBadge from '../../components/uni-ui/uni-badge/uni-badge.vue'
	import msgList from '../../components/msg/msg-list.vue';
	import uniPopup from '../../components/uni-ui/uni-popup/uni-popup.vue'
	
	
	export default {
		components:{
			uniBadge,
			msgList,
			uniPopup
		},
		data() {
			return {
				list : [],
				loading : true
			}
		},
		onShow() {
			this.checkHeart();
		},
		// 页面加载
		onLoad(){
			
			
			this.getChatList()
			
			this.checkHeart();
			

			// 监听个人空间发送消息
			uni.$on('sendChat',(data) => {
				let index = null;
				_this.list.forEach((v,index2) => {
					if((v.send_userid === data.send_userid || v.send_userid === data.reply_userid) && (v.reply_userid === data.send_userid || v.reply_userid === data.reply_userid)){
						index = index2
					}
				})
				if(index !== null){
					uni.navigateTo({
						url:"../../pages/user-chat/user-chat?index=" + index 
					})
				}else{
					_this.sendChat(data)
				}
				
			})
			
			uni.$on('logout',() => {
				_this.list = []
			})
			
			uni.$on('login',() => {
				_this.getChatList()
			})
			
			
		
		},
		onUnload() {
			uni.$off('sendChat')
			uni.$off('logout')
			uni.$off('login')
		},
		// 监听下拉刷新
		onPullDownRefresh() {
			this.refresh()
		},
		// 监听原生导航栏
		onNavigationBarButtonTap(e){
			switch(e.index){
				case 0 : //左边
				uni.navigateTo({
					url:"../user-list/user-list"
				})
				this.$refs.popup.close()
					break;
				case 1 : //右边
				this.$refs.popup.open()
					break;
			}
		},
		methods: {
			checkHeart(){
				let _this = this;
				
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
				uni.onSocketClose(function (res) {
				  console.log('WebSocket 已关闭！');
				});
			},
			// 发起聊天请求
			sendChat(e){
				let _this = this;
				// 建立两个端的数据 一份发送到服务端 一份存储到客户端
				let serverUser = {
					send_userid : e.send_userid,
					reply_userid : e.reply_userid,
					reply_time : new Date().getTime(),
					reply_content : '',
					reply_number : 0
				}
				// 客户端
				let clientUser = {
					send_userid : e.send_userid,
					reply_userid : e.reply_userid,
					update_time : new Date().getTime(),
					avatar : e.userpic,
					username : e.username,
					data : '',
					noread : 0
				}
				uniCloud.callFunction({
					name : 'chat',
					data : {
						action : 'newChat',
						serverUser
					},
					success(res) {
						if(res.result.id){
							clientUser._id = res.result.id
							_this.list.push(clientUser)
							uni.hideLoading()
						}
						
					}
				})
			},
			handleWsMessage(e){
				let message = JSON.parse(e.data).list;
				let index = 0
				this.list.forEach((v) => {
					if((v.send_userid === message.send_userid || v.send_userid === message.reply_userid) && (v.reply_userid === message.send_userid || v.reply_userid === message.reply_userid)) 
					{
						v.data = message.content
						v.update_time = message.create_time
						index++;
					}
				})
				if(index === 0){
					let userMessage = {
						avatar:message.userpic,
						data:message.content,
						noread:"0",
						reply_userid:message.reply_userid,
						send_userid:message.send_userid,
						update_time:message.create_time,
						username:message.username
					}
					this.list.push(userMessage)
				}
			},
			formData(arr){
				return arr.map((item) => {
					return {
						send_userid : item.send_userid,
						reply_userid : item.reply_userid,
						avatar : item.user[0].userpic,
						username : item.user[0].username,
						update_time : item.reply_time,
						data : item.reply_content,
						noread : item.reply_number
					}
				})
			},
			getChatList(){
				let _this = this;
				uniCloud.callFunction({
					name : 'chat',
					data : {
						action : 'getAllChat',
						id : uni.getStorageSync('user').id
					},
					success(res){
						
						res.result.res.data = _this.formData(res.result.res.data)
						res.result.res2.data = _this.formData(res.result.res2.data)
						
						_this.list = [...res.result.res.data,...res.result.res2.data]
						_this.list = _this.list.sort(function(a,b){
							return a.update_time < b.update_time ? -1 : 1
						})
						uni.setStorageSync('chat',_this.list)
						_this.loading = false
					},
					fail(res){
						console.log(res)
					}
				})
			},
			// 下拉刷新
			refresh(){
				setTimeout(() => {
					// 停止下拉刷新
					this.getChatList()
					uni.stopPullDownRefresh()
				},1000)
			},
			popupEvent(e){
				switch(e){
					case 'friend' : 
					uni.navigateTo({
						url:"../search/search?type=user"
					})
					break;
					case 'clear' :
					 this.list = [];
					 uni.removeStorageSync('chat');
					 break;
				}
				// 关闭弹出层
				this.$refs.popup.close()
			}
		}
	}
</script>

<style>

</style>
