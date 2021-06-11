<template>
	<view >
		<block v-for="(item,index) in data" :key="index">
			
			<view class="uni-comment-list" >
				<view class="uni-comment-face">
					<image :src="item.user.userpic ? item.user.userpic : '../../static/default.jpg'" class="rounded-0" mode="widthFix"></image>
				</view>
				<view class="uni-comment-body">
					<view class="uni-comment-top">
						<text>{{item.user.username}}</text>
						<view class="uni-comment-date">
							<view class="">{{item.create_time|formatTime}}</view>
						</view>
					</view>
					<view class="font-sm" @click="replyFunction(item.id,item.fid,item.user.username)">
						回复<text class="text-main">{{item.reply_username}}:</text>
						<text class="font-sm " style="margin-left: 5rpx;">{{item.data}}</text>
					</view>
				</view>
			</view>
		</block>
		
		
		
	</view>
</template>

<script>
	import $T from '@/common/css/time.js'
	export default{
		name : 'detail-list',
		props : {
			data : Array,
		},
		// 过滤器
		filters:{
			formatTime(value){
				 return $T.gettime(value); 
			}
		},
		inject:['replyFunction'],
		methods: {
			
		}
		
	}
</script>

<style>
</style>
