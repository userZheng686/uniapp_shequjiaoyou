<template>
	<view>
		<input class="uni-input" type="password" v-model="oldpassword" placeholder="输入旧密码" />
		<input class="uni-input" type="password" v-model="newpassword" placeholder="输入新密码" />
		<input class="uni-input" type="password" v-model="renewpassword" placeholder="输入确认密码" />
		
		<view class="py-2 px-3">
			<button type="primary" class="bg-main text-white" 
			style="border-radius: 50rpx;border: 0;"
			:class="disabled ? 'bg-main-disabled' : ''"
			@click="submit"
			:disabled="disabled">设置</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				oldpassword : "",
				newpassword : "",
				renewpassword : "",
				
			}
		},
		computed:{
			disabled(){
				return this.oldpassword == false || this.newpassword == false || this.renewpassword == false
			}
		},
		methods: {
			// 验证
			check(){
				if(this.newpassword !== this.renewpassword){
					uni.showToast({
						title : '两次密码不一致',
						icon : 'none'
					})
				}
				return true
			},
			submit(){
				if(!this.check()){
					return
				}
				let _this = this;
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'updateUserPassword',
						uid : uni.getStorageSync('user').id,
						oldPassword : _this.oldpassword,
						newPassword : _this.newpassword,
					},
					success(res) {
						console.log(res.code)
						uni.showToast({
							title : '提交成功',
						})
					},
					fail(res) {
						console.log(res)
					}
				})
				
			}
		}
	}
</script>

<style>

</style>
