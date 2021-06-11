<template>
	<view>
		<template v-if="loginStatus">
			<view class="flex align-center p-2" hover-class="bg-light">
				<image :src="user.userpic ? user.userpic : '../../static/default.jpg'" 
				style="width: 100rpx;height: 100rpx;"
				class="rounded-circle"
				mode=""></image>
				<view class="flex flex-column flex-1 px-2 ">
					<text class="font-lg font-weight-bold text-dark">
						{{user.username}}
					</text>
					<text class="font text-muted">总帖子{{user.posting}} 今日发帖{{today_posting}}</text>
				</view>
			</view>
		</template>
		<template v-else>
			<view class="flex justify-center align-center font-md" style="color:#0040D0" @click="login()">请登录</view>
		</template>
		
		<view class="flex align-center px-3 py-2">
			<view class="flex-1 flex flex-column align-center justify-center" >
				<text class="font-lg font-weight-bold">{{user.posting}}</text>
				<text class="font text-muted">帖子</text>
			</view>
			<view class="flex-1 flex flex-column align-center justify-center" >
				<text class="font-lg font-weight-bold">{{user.comment}}</text>
				<text class="font text-muted">评论</text>
			</view>
			<view class="flex-1 flex flex-column align-center justify-center" >
				<text class="font-lg font-weight-bold">{{user.fens}}</text>
				<text class="font text-muted">粉丝</text>
			</view>
		</view>
		
		<view class="px-3">
			<image src="../../static/demo/banner1.jpg" mode="aspectFill"
			style="height: 170rpx;width: 100%;" class="rounded"></image>
		</view>
		
		<uni-list-item title="浏览历史" showExtraIcon showArrow @click="openHistory">
			<text slot="icon" class="iconfont icon-liulan"></text>
		</uni-list-item>
		<uni-list-item title="社区认证" showExtraIcon showArrow>
			<text slot="icon" class="iconfont icon-huiyuanvip"></text>
		</uni-list-item>
	</view>
</template>

<script>
	import uniListItem from '../../components/uni-ui/uni-list-item/uni-list-item.vue'
	export default {
		components:{
			uniListItem
		},
		data() {
			return {
				loginStatus : false,
				today_posting : 0,
				user : {}
			}
		},
		onLoad() {
			console.log(this.$Route)
			// 获取用户是否登录
			this.getLogin();
			this.getUserInfo();
			
			let _this = this;
			uni.$on('updateInfo',(key) => {
				switch(key){
					case 'comment' : {
						_this.user.comment++;
						break;
					};
					case 'posting' : {
						_this.user.all_posting++;
						_this.today_posting++;
						break;
					};
					case 'user' : {
						_this.user = JSON.parse(uni.getStorageSync('userinfo'))
						break;
					}
				}
			})
			uni.$on('login',(data) => {
				if(data){
					_this.loginStatus = true
					_this.getUserInfo();
				}
			})
			uni.$on('logout',() => {
				_this.loginStatus = false
				_this.user = {}
				_this.today_posting = 0
			})
			
		},
		onUnload() {
			uni.$off('updateInfo')
			uni.$off('login')
			uni.$off('logout')
		},
		onNavigationBarButtonTap() {
			uni.navigateTo({
				url : "../user-set/user-set"
			})
		},
		methods: {
			getLogin(){
				let id = uni.getStorageSync('user').id;
				if(id){
					this.loginStatus = true;
				}else{
					this.loginStatus = false;
				}
			},
			getUserInfo(){
				let _this = this;
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'getUserInfo',
						id : uni.getStorageSync('user').id
					},
					success(res) {
						_this.user = res.result.data[0]
						_this.user.fens = _this.user.fens.length;
						uni.setStorageSync('userinfo',JSON.stringify(_this.user))
					}
				});
				let date1 = new Date().getFullYear() + '-' + (new Date().getMonth()+1) + '-' + new Date().getDate()
				let date2 = new Date(( new Date()).getTime()+1000*60*60*24).getFullYear() + '-' + (new Date(( new Date()).getTime()+1000*60*60*24).getMonth()+1) + '-' + new Date(( new Date()).getTime()+1000*60*60*24).getDate()
				uniCloud.callFunction({
					name : 'user-do',
					data: {
						action : 'getTodayPosting',
						id : uni.getStorageSync('user').id,
						date1 : date1,
						date2 : date2
					},
					success(res) {
						_this.today_posting = res.result.data.length
					},
					fail(res) {
						console.log(res)
					}
				})
			},
			login(){
				uni.navigateTo({
					url:"../login/login"
				})
			},
			openHistory(){
				uni.navigateTo({
					url : '../history/history'
				})
			}
		}
	}
</script>

<style>

</style>
