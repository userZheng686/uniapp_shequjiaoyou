<template>
		<!--列表样式-->
		<view class="p-2 animated fast fadeIn"  >
			<!--头像昵称 | 关注按钮-->
			<view class="flex align-center" style="justify-content: space-between;">
					<!--头像-->
					<image class="rounded-circle" :src="item.userpic ? item.userpic : '../../static/default.jpg'" style="width: 65rpx;height: 65rpx;"
					 lazy-load mode="" @click="openSpace(item.userid)"></image>
					<!--昵称发布时间-->
					<view class="ml-2 flex-1" style="align-items: left;flex-direction: column;">
						<view class="font" style="line-height: 1.5;">
							{{item.username}}
						</view>
						<text class="font-sm text-light-muted" style="line-height: 1.5;">
							{{item.newstime|formatTime}}
						</text>
					</view>
					<!--按钮-->
					<view class="flex align-center justify-center rounded bg-main text-white animated faster"
					 hover-class="jello" style="width: 90rpx;height: 50rpx;" @click="follow(index)" v-if="!item.isFollow">关注</view>
			</view>
			<!--标题-->
			<view class="font my-1" style="" @click="openDetail">
				{{item.title}}
			</view>
			<!--帖子详情-->
			<slot>
				<!--图片-->
				<image v-if="item.titlepic" :src="item.titlepic" class="rounded w-100" mode="widthFix" style="height: 350rpx;"></image>
			</slot>
			<!--图标按钮-->
			<view class="flex align-center" style="">
				<view class="flex align-center justify-center flex-1 animated faster" hover-class="jello text-main"
				 @click="doSupport('support')" :class="item.support.type === 'support' ? 'support-active' : ''">
					<text class="iconfont icon-dianzan2 mr-2" ></text>
					<text>{{item.support.support_count > 0 ? item.support.support_count : '支持'}}</text>
				</view>
				<view class="flex align-center justify-center flex-1 animated faster" hover-class="jello text-main" 
				 @click="doSupport('unsupport')" :class="item.support.type === 'unsupport' ? 'support-active' : ''">
					<text class="iconfont icon-cai mr-2" ></text>
					<text>{{item.support.unsupport_count > 0 ? item.support.unsupport_count : '踩'}}</text>
				</view>
				<view class="flex align-center justify-center flex-1 animated faster" hover-class="jello text-main"
				 @click="doComment">
					<text class="iconfont icon-pinglun2 mr-2" ></text>
					<text>{{item.comment_count}}</text>
				</view>
				<view class="flex align-center justify-center flex-1 animated faster" hover-class="jello text-main" 
				@click="doShare">
					<text class="iconfont icon-fenxiang mr-2" ></text>
					<text>{{item.share_num}}</text>
				</view>
			</view>
		</view>
	
</template>

<script>
	// 引入时间库
	import $T from '@/common/css/time.js'
	export default{
		props: {
			item : Object,
			pindex : {
				type : Number,
				default : 0
			},
			index : {
				type : Number,
				default : -1
			},
			isdetail : {
				type : Boolean,
				default : false
			}
		},
		data(){
			return {
				
			}
		},
		// 过滤器
		filters:{
			formatTime(value){
				 return $T.gettime(value); 
			}
		},
		methods : {
			// 打开个人空间
			openSpace(userid){
				uni.navigateTo({
					url : "../../pages/user-space/user-space?userid=" + userid
				})
			},
			// 关注
			follow(index){
				this.$emit('follow',this.index)
			},
			// 查看详情
			openDetail(){
				// 处于详情中
				if(this.isdetail) return ;
				let arrindex = [this.pindex,this.index]
				this.item.arrayindex = [this.pindex,this.index]
				uni.navigateTo({
					url : '../../pages/detail/detail?detail='+JSON.stringify(this.item)
				})
				let list = uni.getStorageSync('history')
				list = list ? JSON.parse(list) : [];
				let index = list.findIndex((v) => v._id === this.item._id);
				if(index === -1){
					list.unshift(this.item)
					uni.setStorageSync('history',JSON.stringify(list))
				}
				
			},
			// 顶和踩操作
			doSupport(type){
				this.$emit('doSupport',{
					type : type,
					index : this.index
				})
			},
			// 评论
			doComment(){
				if(this.isdetail){
					return this.openDetail()
				}
				this.$emit('doComment')
			},
			// 分享
			doShare(){
				if(this.isdetail){
					return this.openDetail()
				}
				this.$emit('doShare')
			}
		}
	}
</script>

<style>
	.support-active {
		color : #FF4A6A
	}
</style>
