<template>
	<view>
		<!--头部-->
		<view class="flex align-center p-3 bottom-border border-light-secondary">
			<image :src="userinfo.userpic ? userinfo.userpic : '../../static/default.jpg'" 
			style="width: 180rpx;height: 180rpx;"
			class="rounded-circle"
			mode=""></image>
			<view class="pl-3 flex flex-column  flex-1">
				<view class="flex align-center">
					<view class="flex-1 flex flex-column align-center justify-center">
						<text class="font-lg font-weight-bold">{{userinfo.all_posting}}</text>
						<text class="font text-muted">帖子</text>
					</view>
					<view class="flex-1 flex flex-column align-center justify-center">
						<text class="font-lg font-weight-bold">{{userinfo.follow}}</text>
						<text class="font text-muted">关注</text>
					</view>
					<view class="flex-1 flex flex-column align-center justify-center">
						<text class="font-lg font-weight-bold">{{userinfo.fens}}</text>
						<text class="font text-muted">粉丝</text>
					</view>
				</view>
				<view class="flex justify-center align-center" v-if="!isFollow">
					<button @click="followBtn" type="primary" style="width: 400rpx;"  size="mini" class="bg-main w-100">关注</button>
				</view>
			</view>
		</view>
		
		<!--tab-->
		<view class="flex align-center" style="height: 100rpx;">
			<view class="flex-1 flex align-center justify-center" 
			v-for="(item,index) in tabBars" :key="index" :class="index === tabIndex ? 'font-lg font-weight-bold  text-main' : 'font-md'"
			@click="changeTab(index)">
				{{item.name}}
			</view>
		</view>
		
		<template v-if="tabIndex===0">
			<view class="p-3 border-bottom">
				<view class="font-md">
					账号信息
				</view>
				<view class="font">
					账号年龄：{{userinfo.create_time|formatUserAge}}
				</view>
				<view class="font">
					账号id：{{userinfo.userid}}
				</view>
			</view>
			<view class="p-3 border-bottom">
				<view class="font-md">
					个人信息
				</view>
				<view class="font">
					星座：{{userinfo.birthday|formatUserBirthday}}
				</view>
				<view class="font">
					职业：{{userinfo.job ? userinfo.job : '未知'}}
				</view>
				<view class="font">
					故乡：{{userinfo.path ? userinfo.path : '未知'}}
				</view>
				<view class="font">
					情感：{{userinfo.qg ? userinfo.qg : '未知'}}
				</view>
			</view>
		</template>
		<template v-else>
			<view class="animated fast fadeIn">
				<scroll-view scroll-y="true" :style="'height:' + scrollH + 'px;'" @scrolltolower="loadmore">
					<block v-for="(item,index) in list" :key="index">
						<common-list :key="index" :item="item" :index="index"  @follow="follow" @doSupport="doSupport"></common-list>
						<divider></divider>
					</block>
					<loadMore :loadmore="loadmores"></loadMore>
				</scroll-view>
			</view>
		</template>
		
		<!--弹出层-->
		<uni-popup ref="popup" type="top" >
			<view class="w-100" style="background-color: white;">
				<view class="flex align-center justify-center font-md border-bottom py-2" 
				@click="popupEvent('blacklist')"
				hover-class="bg-light" >
					<text class="iconfont icon-sousuo mr-2"></text> {{popuptext}}
				</view>
				<view class="flex align-center justify-center font-md border-bottom py-2"
				 @click="popupEvent('chat')"
				 hover-class="bg-light">
					<text class="iconfont icon-shanchu mr-2"></text> 聊天
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	
	import $T from '../../common/css/time.js';
	import commonList from '../../components/common/common_list.vue'
	import loadMore from '@/components/common/load_more.vue';
	import uniPopup from '../../components/uni-ui/uni-popup/uni-popup.vue'
	
	export default {
		components:{
			commonList,
			loadMore,
			uniPopup
		},
		data() {
			return {
				userinfo : {
					userid : 0,
					create_time : 0,
					all_posting : 0,
					follow : 0,
					fens : 0,
					birthday : 0
				},
				scrollH : 600,
				isFollow : false,
				tabIndex : 0,
				tabBars : [{
					name : "主页",
				},{
					name : "帖子",
					list : [],
				}],
				otherblacklist : [],
				userid : '',
				loadmores: '上拉加载更多',
				popuptext : '加入黑名单',
				istalk : true,
			}
		},
		// 过滤器
		filters:{
			formatUserAge(value){
				if(value !== 0 && value !== ''){
					return $T.getAgeByBirthday(new Date(value).getFullYear() + '-' + (new Date(value).getMonth()+1) + '-' + new Date(value).getDate());
				}else{
					return '未知'
				}
			},
			formatUserBirthday(value){
				if(value !== 0 && value !== ''){
					return $T.getHoroscope(value);
				}else{
					return '未知'
				}
			}
		},
		computed:{
			list(){
				return this.tabBars[this.tabIndex].list
			}
		},
		// 监听原生导航栏
		onNavigationBarButtonTap(){
			this.$refs.popup.open()
		},
		onLoad(e) {
			uni.getSystemInfo({
				success: res => {
					this.scrollH = res.windowHeight - uni.upx2px(100);
				}
			});
			
			if(e.userid){
				this.userid = e.userid
				this.getUserInfo()
				this.getPosting()
				this.getBlacklist()
			}
			let _this = this;
			//监听数组操作
			uni.$on('updateData',(data) => {
				// 取出数组元素下标
				_this.tabBars[1].list.forEach((item) => {
					if(item._id === data._id){
						item.comment_count = data.comment_count;
						item.support = data.support;
						item.isFollow = data.isFollow;
					}
				})
				_this.isFollow = true
			});
			
			uni.$on('follow',(id,username,userpic) => {
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'addSupport',
						user: {
							userid : uni.getStorageSync('user').id
						},
						follow : {
							userid:id,
							username,
							userpic
						}
					},
					success(res){
						_this.tabBars[1].list.forEach(item => {
							if(item.userid === id){
								item.isFollow = true;
							}
						})
						uni.showToast({
							title : '关注成功',
							icon : 'none'
						})
					},
					fail(res){
						uni.showToast({
							title : '关注失败',
							icon : 'none'
						})
					}
				})
			})
			
		},
		onUnload() {
			uni.$off('updateData')
			uni.$off('follow')
		},
		methods: {
			changeTab(index){
				this.tabIndex = index
			},
			// 获取用户信息
			getUserInfo(){
				let _this = this;
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'getUserInfo',
						id : _this.userid
					},
					success(res) {
						let item = res.result.data[0]
						
						_this.userinfo = {
							userid : _this.userid,
							username : item.username,
							userpic : item.userpic,
							create_time : item.create_time,
							all_posting : item.posting,
							comment : item.comment,
							fens : item.fens.length,
							follow : item.follow.length,
							birthday : item.birthday,
							job : item.job,
							qg : item.qg,
							path : item.path
						}
					}
				});
			},
			// 获取用户帖子
			getPosting(){
				let _this = this;
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						action : 'getUserPostingListFirst',
						id : _this.userid,
						pageSize : 3
					},
					success(res) {
						if(res.result.data.length < 3){
							_this.loadmores = '没有更多了...'
						}else{
							_this.loadmores = '上拉加载更多'
						}
						_this.tabBars[1].list = _this.formData(res.result.data)
					}
				})
			},
			// 获取是否在黑名单内
			getBlacklist(){
				let _this = this;
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'getBlacklist',
						uid : uni.getStorageSync('user').id,
						otherid : _this.userid
					},
					success(res) {
						let ownBlacklist = res.result.own.data[0].blacklist
						_this.otherblacklist = res.result.other.data[0].blacklist
						let index = ownBlacklist.findIndex(v => v === _this.userid)
						let index2 = _this.otherblacklist.findIndex(v => v === uni.getStorageSync('user').id)
						if(index !== -1){
							_this.popuptext = '解除黑名单'
						}
						
						if(index !== -1 || index2 !== -1){
							_this.istalk = false
						}
						
					}
				})
			},
			// 格式化数据
			formData(arr){
				arr = arr.map((item) => {
					//先找出fens字段 然后判断是否关注了
					let follow = false;
					let fens = item.user[0].fens
					if(item.user_id === uni.getStorageSync('user').id){
						follow = true
					}else{
						for(let i=0;i<fens.length;i++){
							if(fens[i].userid === uni.getStorageSync('user').id){
								follow = true
							}
						}
					}
					this.isFollow = follow;
						
					let obj =  {
						_id : item._id,
						post_class_id : item.post_class_id,
						userid : item.user[0].user_id,
						username: item.user[0].username,
						userpic: item.user[0].userpic,
						newstime: item.create_time,
						isFollow: follow,
						title: item.title,
						titlepic: item.titlepic,
						content : item.content,
						support: {
							type: '',
							support_count: item.ding_count,
							unsupport_count: item.cai_count
						},
						comment_count: item.comment_count,
						share_num: item.sharenum,
						content : item.content,
						images:item.images
					}
					
					item.support.forEach((items) => {
						if(items.user_id === uni.getStorageSync('user').id){
							if(items.type === 0){
								obj.support.type = 'support'
							}else{
								obj.support.type = 'unsupport'
							}
						}
					})
					
					return obj
				})
				return arr
			},
			// 修改历史记录
			updateHistory(item){
				if(uni.getStorageSync('history') !== ""){
					let history = JSON.parse(uni.getStorageSync('history'))
					history.forEach((v) => {
						if(v._id === item._id){
							v.isFollow = item.isFollow
							v.support = item.support
							v.comment = item.comment
							v.share_num = item.share_num
						}
					})
					history = JSON.stringify(history)
					uni.setStorageSync('history',history)
				}
				
			},
			// 关注用户
			followBtn(){
				let _this = this;
				_this.checkAuth(() => {
					let user = _this.tabBars[1].list[0]
					uni.$emit('follow',user.userid,user.username,user.userpic)
				})
			},
			follow(index) {
				let _this = this;
				_this.checkAuth(() => {
					let user = _this.tabBars[1].list[index]
					_this.updateHistory(user)
					uni.$emit('follow',user.userid,user.username,user.userpic)
				})
			},
			doSupport(e) {
				let _this = this;
				_this.checkAuth(() => {
					let list = _this.tabBars[this.tabIndex].list
					let item = list[e.index]
					let msg = e.type === "support" ? "点赞" : "反对";
					if (item.support.type === '') {
						item.support.type = e.type;
						item.support[e.type + '_count']++;
						let user = {
							user_id : uni.getStorageSync('user').id,
							post_id : item.id,
							type : e.type === 'support' ? 0 : 1,
							create_time : new Date().getTime()
						}
						uniCloud.callFunction({
							name : "get-article",
							data : {
								action : 'firstStarOrUnstar',
								id : item._id,
								support_count : item.support.support_count,
								unsupport_count : item.support.unsupport_count,
								user
							},
							success(res) {
								if(res.result.updated === 1){
									uni.showToast({
										title: msg + "成功"
									})
									_this.updateHistory(item)
								}else{
									uni.showToast({
										title: msg + "失败"
									})
								}
							},
							fail() {
								uni.showToast({
									title: msg + "失败"
								})
							}
						})
					}
					else if (item.support.type === 'support' && e.type === 'unsupport') {
						item.support.support_count--;
						item.support.unsupport_count++;
						uniCloud.callFunction({
							name : 'get-article',
							data : {
								action : 'unStarArticle',
								id : item._id,
								support_count : item.support.support_count,
								unsupport_count : item.support.unsupport_count
							},
							success(res) {
								if(res.result.updated === 1){
									uni.showToast({
										title: msg + "成功"
									})
									_this.updateHistory(item)
								}else{
									uni.showToast({
										title: msg + "失败"
									})
								}
							},
							fail() {
								uni.showToast({
									title: msg + "失败"
								})
							}
						})
					} else if (item.support.type === 'unsupport' && e.type === 'support') {
						item.support.support_count++;
						item.support.unsupport_count--;
						uniCloud.callFunction({
							name : 'get-article',
							data : {
								action : 'starArticle',
								id : item._id,
								support_count : item.support.support_count,
								unsupport_count : item.support.unsupport_count
							},
							success(res) {
								if(res.result.updated === 1){
									uni.showToast({
										title: msg + "成功"
									})
									_this.updateHistory(item)
								}else{
									uni.showToast({
										title: msg + "失败"
									})
								}
							},
							fail() {
								uni.showToast({
									title: msg + "失败"
								})
							}
						})
					}
					item.support.type = e.type;
					uni.$emit('otherUpdate',item)
				})
			},
			// 上拉加载更多
			loadmore() {
				let _this = this;
				// 拿到当前列表
				let item = _this.tabBars[1].list[_this.tabBars[1].list.length-1];
				// 判断是否处于可加载状态（上拉加载更多）
				if (_this.loadmores !== '上拉加载更多') {
					return;
				}
				// 修改当前列表加载状态
				_this.loadmores = '加载中...';
				// 模拟数据请求
				setTimeout(async () => {
					uniCloud.callFunction({
						name : 'get-article',
						data : {
							action : 'getUserPostingListSecond',
							pageSize : 3,
							lastId : _this.tabBars[1].list[_this.tabBars[1].list.length-1]._id,
							id : _this.userid
						},
						success(res) {
							if(res.result.data.length < 3){
								_this.loadmores = '没有更多了...'
							}else{
								_this.loadmores = '上拉加载更多'
							}
							res.result.data = _this.formData(res.result.data)
							_this.tabBars[1].list = [..._this.tabBars[1].list,...res.result.data]
						}
					})
					
				}, 1000);
			},
			// 弹出层
			popupEvent(action){
				let _this = this;
				switch(action){
					case 'blacklist' : {
						if(_this.userid === uni.getStorageSync('user').id){
							uni.showToast({
								title : '不能拉黑自己噢',
								icon : 'none'
							})
						}else{
							if(_this.popuptext === '加入黑名单'){
								uniCloud.callFunction({
									name : 'user-do',
									data : {
										action : 'AddBlacklist',
										uid : uni.getStorageSync('user').id,
										otherid : _this.userid
									},
									success(res) {
										if(res.result.updated === 1){
											uni.showToast({
												title : '拉黑成功'
											})
											_this.$refs.popup.close()
											_this.popuptext = '解除黑名单'
											_this.istalk = false
										}else{
											_this.$refs.popup.close()
											uni.showToast({
												title : '拉黑失败',
												icon : 'none'
											})
										}
									},
									fail() {
										_this.$refs.popup.close()
										uni.showToast({
											title : '拉黑失败',
											icon : 'none'
										})
									}
								})
							}else{
								uniCloud.callFunction({
									name : 'user-do',
									data : {
										action : 'DelBlacklist',
										uid : uni.getStorageSync('user').id,
										otherid : _this.userid
									},
									success(res) {
										if(res.result.updated === 1){
											_this.$refs.popup.close()
											uni.showToast({
												title : '解除成功'
											})
											let index = _this.otherblacklist.findIndex(v => v === uni.getStorageSync('user').id)
											if(index === -1){
												_this.istalk = true
											}
											_this.popuptext = '加入黑名单'
										}else{
											_this.$refs.popup.close()
											uni.showToast({
												title : '解除失败',
												icon : 'none'
											})
										}
									},
									fail() {
										_this.$refs.popup.close()
										uni.showToast({
											title : '解除失败',
											icon : 'none'
										})
									}
								})
							}
						}
						break;
					};
					case 'chat' : {
						if(_this.userid === uni.getStorageSync('user').id){
							_this.$refs.popup.close()
							uni.showToast({
								title : '不能更自己聊天噢',
								icon : 'none'
							})
						}else{
							_this.$refs.popup.close()
							if(_this.istalk === false){
								uni.showToast({
									title : '对方已被您拉黑或者对方拉黑了您，不能进行聊天',
									icon : 'none'
								})
							}else{
								// 聊天数据
								let chatId = {
									send_userid : uni.getStorageSync('user').id,
									reply_userid : _this.userid,
									userpic : _this.userinfo.userpic,
									username : _this.userinfo.username
								}
								uni.showLoading({
									title : '请稍等，正在加载数据',
									mask : false
								})
								let chat = uni.getStorageSync('chat')
								let index = null
								chat.forEach((v,index2) => {
									if((v.send_userid === chatId.send_userid || v.send_userid === chatId.reply_userid) && (v.reply_userid === chatId.send_userid || v.reply_userid === chatId.reply_userid)){
										index = index2
									}
								})
								if(index !== null){
									uni.navigateTo({
										url:"../../pages/user-chat/user-chat?index=" + index 
									})
								}else{
									uni.$emit('sendChat',chatId)
								}
								
							}
						}
						break;
					};
				}
			}
		}
	}
</script>

<style>

</style>
