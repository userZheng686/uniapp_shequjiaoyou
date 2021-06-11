<template>
	<view class="flex align-center p-2 border-bottom border-light-secondary animated fast fadeIn"  
	@click="open"
	hover-class="bg-light" >
		<image :src="item.avatar ? item.avatar : '../../static/default.jpg'"style="height: 80rpx;width: 80rpx;"
		  class="rounded-circle mr-2"
		  mode=""></image>
		<view class="flex flex-column flex-1 ">
			<view class="flex align-center justify-between">
				<text class="font-md">{{item.username}}</text>
				<text class="font text-secondary">{{item.update_time | formatTime}}</text>
			</view>
			<view class="flex align-center justify-between">
				<text class="text-secondary text-ellipsis" style="max-width: 500rpx;">{{item.data}}</text>
				<template v-if="item.noread > 0">
					<uniBadge :text="item.noread" type="error"></uniBadge>
				</template>
				
			</view>
		</view>
	</view>
</template>

<script>
	import uniBadge from '../uni-ui/uni-badge/uni-badge.vue'
	// 引入时间库
	import $T from '@/common/css/time.js'
	
	export default{
		components:{
			uniBadge
		},
		props : {
			item : Object,
			index : Number
		},
		// 过滤器
		filters:{
			formatTime(value){
				 return $T.gettime(value); 
			}
		},
		methods:{
			// 打开聊天页
			open(){
				uni.navigateTo({
					url:"../../pages/user-chat/user-chat?index=" + this.index 
				})
			}
		}
	}
</script>

<style>
</style>
