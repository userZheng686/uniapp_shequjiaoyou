<template>
	<view>
		<uni-list-item title="账号与安全" showArrow @click="open('user-password')"></uni-list-item>
		<uni-list-item v-if="email" title="绑定邮箱" showArrow @click="open('user-email')"></uni-list-item>
		<uni-list-item title="资料编辑" showArrow @click="open('user-userinfo')"></uni-list-item>
		<uni-list-item title="清除缓存"  @click="clear" showBadge>
			<view slot="right" class="text-muted">
				{{currentSize|format}}
			</view>
		</uni-list-item>
		
		<view class="py-2 px-3">
			<button class="bg-main text-white"
			 style="border-radius: 50rpx;border:0"
			 type="primary" @click="logout()">退出登录</button>
		</view>
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
				currentSize : 0,
				email : true,
			}
		},
		onLoad(e) {
			this.getStorageInfo()
			this.getUserEmail()
		},
		filters:{
			format(value){
				return value > 1024 ? (value/1024).toFixed(2) + 'MB' : value.toFixed(2) + 'KB'  
			}
		},
		methods: {
			getUserEmail(){
				let email = JSON.parse(uni.getStorageSync('userinfo')).email
				if(email){
					this.email = false
				}
			},
			getStorageInfo(){
				let res = uni.getStorageInfoSync();
				this.currentSize = res.currentSize;
			},
			open(path){
				uni.navigateTo({
					url:`../${path}/${path}`
				})
			},
			// 清除缓存
			clear(){
				uni.showModal({
					title : '提示',
					content : '是否要清除所有缓存?',
					cancelText : '不清除',
					confirmText : '清除',
					success: (res) => {
						if(res.confirm){
							uni.clearStorageSync()
							this.getStorageInfo()
							uni.showToast({
								title:'清除成功',
								icon:'success'
							})
						}
					}
				})
			},
			logout(){
				uni.removeStorageSync('uni_id_token_expired')
				uni.removeStorageSync('userinfo')
				uni.removeStorageSync('add-input')
				uni.removeStorageSync('user')
				uni.removeStorageSync('uni_id_token')
				uni.removeStorageSync('history')
				uni.removeStorageSync('chat')
				uni.removeStorageSync('searchHistory')
				uni.showToast({
					title : '退出成功',
					icon : 'none'
				})
				uni.navigateBack({
					delta:1
				})
				uni.$emit('logout')
			}
		}
	}
</script>

<style>

</style>
