<template>
	<view class="">
		<!--时间-->
		<view v-if="shortTime" class="py-2 flex align-center justify-center font text-light-muted">
			{{shortTime}}
		</view>
		
		<!--消息气泡-->
		<view class="flex align-start px-2 my-2"
		:style="isSelf ? 'flex-direction:row-reverse' : ''">
			<image :src="item.avatar ? item.avatar : '../../static/default.jpg'"
			 style="width: 100rpx;height: 100rpx;"
			 class="rounded-circle"
			 mode=""></image>
			 <view class="bg-light p-2 rounded mx-2"
			  style="max-width: 400rpx"
			  :class="isSelf ? 'text-right' : ''">
				{{item.data}}
			 </view>
		</view>
		
	</view>
</template>

<script>
	import $T from '../../common/css/time.js'
	
	export default{
		props:{
			item : Object,
			index : Number,
			pretime : [Number,String],
		},
		data(){
			return {
				uid : null
			}
		},
		computed:{
			isSelf(){
				return this.uid === this.item.user_id
			},
			// 转化时间
			shortTime(){
				return $T.getChatTime(this.item.create_time,this.pretime)
			}
		},
		created() {
			this.uid = uni.getStorageSync('user').id
		}
	}
</script>

<style>
</style>
