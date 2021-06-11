<template>
	<view class="flex align-center px-5 py-3">
		
		<view class="flex-1 flex align-center justify-center">
			<view 
			style="width: 100rpx;height: 100rpx;"
			@click="login(index)"
			class="iconfont  font-lg text-white flex align-center justify-center rounded-circle icon-weixin bg-success">	
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return {
			}
		},
		methods: {
			login(index){
				// #ifdef MP-WEIXIN
				uni.getUserProfile({
					desc : '登录',
					success(res){
						console.log(res)
					}
				})
				// #endif
				
				// uni.login({
				// 	provider:'weixin',
				// 	success(loginRes) {
				// 		uniCloud.callFunction({
				// 			name : "weixin-login",
				// 			data : {
				// 				code : loginRes.code
				// 			},
				// 			success(res) {
				// 				console.log(res)
				// 			}
				// 		})
				// 		console.log(loginRes)
				// 	}
				// })
			}
		}
	}
</script>

<style>
</style>
