<template>
	<view>
		<uni-status-bar></uni-status-bar>
		<view class="iconfont icon-guanbi flex align-center justify-center font-lg" 
		hover-class="bg-light"
		@click="back"
		style="width: 100rpx;height: 100rpx;">
		</view>
		
		<view class="text-center" style="padding-top: 130rpx;padding-bottom: 70rpx;font-size: 55rpx;">
			{{status ? '邮箱注册' : '账号密码登录'}}
		</view>
		
		<view class="px-2">
			<template v-if="!status">
				<view class="mb-2">
					<input v-model="username" type="text" placeholder="邮箱" class="border-bottom p-2"/>
				</view>
				<view class="mb-2 flex align-stretch">
					<input v-model="password" type="password" placeholder="请输入密码" value=""
					 class="border-bottom p-2 flex-1"/>
					<view class="border-bottom flex align-center justify-center font text-muted" style="width: 150rpx;">
						忘记密码？
					</view>
				</view>
			</template>
			<template v-else>
				<view class="mb-2 flex align-stretch">
					<input v-model="username" type="text" placeholder="邮箱" class="border-bottom p-2 flex-1"/>
				</view>
				<view class="mb-2 flex align-stretch">
					<input v-model="password" type="password" placeholder="请输入密码" class="border-bottom p-2 flex-1"/>
				</view>
				<view class="mb-2 flex align-stretch">
					<input v-model="code" type="text" placeholder="请输入邮箱验证码" value=""
					 class="border-bottom p-2 flex-1"/>
					<view 
					@click="getCode"
					:class="codeTime > 0 ? 'bg-main-disabled' : 'bg-main'"
					class="border-bottom flex align-center justify-center font-sm text-white" style="width: 180rpx;">
						{{codeTime > 0 ? codeTime + 's' : '获取验证码'}}
					</view>
				</view>
			</template>
		</view>
		
		<view class="py-2 px-3">
			<button class="bg-main text-white"
			 style="border-radius: 50rpx;border:0"
			 type="primary"
			 :class="disabled ? 'bg-main-disabled' : ''"
			 @click="submit"
			 :disabled="disabled">{{status ? '注册' : '登录'}}</button>
		</view>
		
		<view class="flex align-center justify-center pt-2 pb-4">
			<view class="text-primary font-sm" @click="changeStatus">
				{{status ? '账号密码登录' : '注册账号'}}
			</view>
			<!-- #ifdef APP-PLUS -->
			<text class="text-muted mx-2">
				|
			</text>
			<view class="text-primary font-sm" @click="oneLogin">
				一键登录
			</view>
			<!-- #endif -->
		</view>
		
		<!-- #ifdef MP-WEIXIN -->
		<view class="flex align-center justify-center">
			<view style="height: 1rpx;background-color: #dddddd;width: 100rpx;"></view>
			<view class="mx-2 text-muted">
				社交账号登录
			</view>
			<view style="height: 1rpx;background-color: #dddddd;width: 100rpx;"></view>
		</view>
				
		<otherLogin></otherLogin>
		
		<view class="flex align-center justify-center text-muted">
			注册即代表同意<text class="text-primary">《xxx社区协议》</text>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	import uniStatusBar from '../../components/uni-ui/uni-status-bar/uni-status-bar.vue'
	import otherLogin from '../../components/common/other-login.vue'
	export default {
		components:{
			uniStatusBar,
			otherLogin
		},
		data() {
			return {
				status : false, // false 登录 true 注册
				username : "",
				password : "",
				code : "",
				codeTime : 0
			}
		},
		computed:{
			disabled(){
				if((this.username == false || this.password == false) && (this.phone == false || this.code == false)){
					return true
				}
				return false
			}
		},
		methods: {
			back(){
				uni.navigateBack({
					delta:1
				})
			},
			// 初始化表单
			initForm(){
				this.username = '';
				this.password = '';
				this.code = '';
			},
			changeStatus(){
				this.initForm()
				this.status = !this.status;
			},
			// 获取验证码
			getCode(){
				if(this.username == false || this.password == false){
					uni.showToast({
						title : '请填写邮箱或者密码',
						icon : 'none'
					})
					return;
				}else if(!this.validate()){
					return;
				}else{
					let _this = this;
					uniCloud.callFunction({
						name : 'user-login',
						data : {
							action : 'emailSend',
							email : this.username,
							serviceType: 'qq',
							method: 'sendCode',
							html: '您注册的验证码是#code#',
							subject: '注册验证码'
						},
						success(res) {
							if(res.result.code === 0){
								if(_this.codeTime > 0){
									return;
								}
								_this.codeTime = 60;
								let timer = setInterval(() => {
									if(_this.codeTime >= 1){
										_this.codeTime--
									}else{
										_this.codeTime = 0;
										clearInterval(timer)
									}
								},1000)
								uni.showToast({
									title:'发送成功',
									icon:'success'
								})
								
							}
						}
					})
				}
				
			},
			// 表单验证
			validate(){
				let mPattern = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
				if(!mPattern.test(this.username)){
					uni.showToast({
						title : '邮箱格式错误',
						icon : 'none'
					})
					return false
				}
				// 更多验证
				return true
			},
			req(action,params){
				return new Promise((resolve,reject) => {
					uniCloud.callFunction({
						name:"user-login",
						data:{
							action : 'emailLogin',
							params : {
								username : params.username,
								password : params.password
							}
						},
						success(res) {
							if(res.result.code === 0){
								uni.setStorageSync('user',{
									id : res.result.uid
								})
								uni.setStorageSync('uni_id_token',res.result.token);
								uni.setStorageSync('uni_id_token_expired',res.result.tokenExpired);
								resolve('ok')
								uni.$emit('login',true)
							}else{
								reject(res.result.msg)
							}
						},
						fail(res) {
							reject('fail')
						}
					});
				})
			},
			// 登录
			submit(){
				uni.showLoading({
				    title: '加载中'
				});
				// 表单验证
				if(!this.validate())return;
				// 判断一下状态 是注册还是登录
				if(!this.status){
					this.req('login',{username:this.username,password:this.password}).then(() => {
						uni.showToast({
							title : '登录成功'
						});
						uni.$emit('login')
						uni.navigateBack({
							delta:1						})
					}).catch((error) => {
						uni.showToast({
							title : error,
							icon : 'none'
						});
					})
				}else{
					uniCloud.callFunction({
						name : 'user-login',
						data : {
							action : 'emailRegister',
							email : this.username,
							code : this.code,
							password : this.password
						},
						success(res) {
							if(res.result.res.code === 0){
								uni.showToast({
									title:'注册成功',
									icon : 'success'
								})
								uni.setStorageSync('user',{
									id : res.result.res.uid
								})
								uni.setStorageSync('uni_id_token',res.result.res.token);
								uni.setStorageSync('uni_id_token_expired',res.result.res.tokenExpired);
								uni.$emit('login')
								uni.navigateTo({
									url:"/pages/index/index"
								})
							}else{
								uni.showToast({
									title : res.result.msg,
									icon : 'none'
								})
							}
						},
						fail(res) {
							console.log(res)
						}
					})
				}
				uni.hideLoading()
			},
			oneLogin(){
				uni.login({
				    provider: 'univerify',
				    univerifyStyle: { 
						fullScreen: true
					},
					success(res) {
						console.log(res)
					},
					fail(res) {
						uni.showToast({
							title : '请检查是否开启了蜂窝网络',
							icon : 'none'
						})
					}
				})
			}
		}
	}
</script>

<style>

</style>
