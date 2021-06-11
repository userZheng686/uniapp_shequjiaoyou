<template>
	<view>
		<input class="uni-input" type="text" v-model="email" placeholder="请输入你要绑定的邮箱" />
		<view class="flex justify-center">
			<input class="uni-input" type="text" v-model="code" placeholder="请输入验证码" />
			<view
			@click="getCode"
			:class="codeTime > 0 ? 'bg-main-disabled' : 'bg-main'"
			class="border-bottom flex align-center justify-center font-sm text-white" style="width: 180rpx;">
				{{codeTime > 0 ? codeTime + 's' : '获取验证码'}}
			</view>
		</view>
		
		
		
		<view class="py-2 px-3">
			<button type="primary" class="bg-main text-white" 
			style="border-radius: 50rpx;border: 0;"
			:class="disabled ? 'bg-main-disabled' : ''"
			@click="submit"
			:disabled="disabled">绑定</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				email : "",
				code : "",
				codeTime : 0
			}
		},
		computed:{
			disabled(){
				return this.email == false || this.code == false 
			}
		},
		methods: {
			check(){
				let rule = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
				if(!rule.test(this.email)){
					uni.showToast({
						title : "邮箱格式不正确",
						icon : 'none'
					})
					return false
				}
				return true
			},
			getCode(){
				let _this = this;
				if(_this.email == false){
					uni.showToast({
						title : '请填写邮箱',
						icon : 'none'
					})
					return;
				}else if(!_this.check()){
					return;
				}else{
					if(_this.codeTime > 0){
						return;
					}
					uniCloud.callFunction({
						name : 'user-login',
						data : {
							action : 'emailSend',
							email : _this.email,
							serviceType: 'qq',
							method: 'sendCode',
							html: '您注册的验证码是#code#',
							subject: '注册验证码'
						},
						success(res) {
							if(res.result.code === 0){
								uni.showToast({
									title:'发送成功',
									icon:'success'
								})
								_this.codeTime = 60;
								let timer = setInterval(() => {
									if(_this.codeTime >= 1){
										_this.codeTime--
									}else{
										_this.codeTime = 0;
										clearInterval(timer)
									}
								},1000)
							}
						},
						fail() {
							uni.showToast({
								title:'发送失败，请重新再试',
								icon:'none'
							})
							
						}
					})
				}
				
			},
			submit(){
				let _this = this;
				if(_this.check()){
					uniCloud.callFunction({
						name : 'user-login',
						data : {
							uid : uni.getStorageSync('user').id,
							email : _this.email,
							code : _this.code
						},
						success(res) {
							console.log(res)
							uni.showToast({
								title : "绑定成功"
							})
						}
					})
					
				}
			}
		}
	}
</script>

<style>

</style>
