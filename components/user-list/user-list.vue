<template>
	<view class="">
		<!--列表样式-->
		<view class="p-2 flex align-center border-bottom border-light-secondary">
			<image :src="item.avatar ? item.avatar : '../../static/default.jpg'" style="width: 100rpx;height: 100rpx;"
			 class="rounded-circle mr-2"
			 mode=""></image>
			<view class="flex flex-column flex-1">
				<text class="font-md text-dark">{{item.username}}</text>
				<uniBage :text="item.age" :type="item.sex === 2 ? 'error' : 'primary'" size="small">
					<text v-if="item.sex > 0" 
					class="iconfont text-white font-sm  " 
					:class="item.sex === 2 ? 'icon-nv' : 'icon-nan'"
					style="margin-right: 5rpx;"></text>
				</uniBage>
				
			</view>
			<view @click="followBtn" class="uni-icon uni-icon-checkbox-filled" :class="item.isFollow ? 'text-light-muted' : 'text-main'">
				
			</view>
		</view>
	</view>
</template>

<script>
	import uniBage from '../../components/uni-ui/uni-badge/uni-badge.vue'
	export default{
		components:{
			uniBage
		},
		props : {
			item : Object,
			index : Number
		},
		methods : {
			followBtn(){
				let _this = this;
				if(this.item.uid === uni.getStorageSync('user').id){
					uni.showToast({
						title : '不能对自己操作噢',
						icon : 'none'
					})
				}else{
					uni.showLoading({
						title: '请稍等',
						mask:false,
					})
					// 关注别人
					if(_this.item.isFollow === true){
						_this.cancelFollow()
					}else{
						_this.followOther()
					}
					_this.$emit('follow',_this.item,!_this.item.isFollow)
					uni.hideLoading()
				}
			},
			followOther(){
				let _this = this;
				// 关注别人
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'addSupport',
						user: {
							userid : uni.getStorageSync('user').id
						},
						follow : {
							userid:_this.item.uid,
							username:_this.item.username,
							userpic:_this.item.userpic
						}
					},
					success(res){
						_this.item.isFollow = true
						uni.showToast({
							title : '关注成功',
							icon : 'none'
						})
					},
					fail(res){
						uni.showToast({
							title : '关注失败',
							icon : 'none'
						})
					}
				})
			},
			cancelFollow(){
				// 取消关注
				let _this = this;
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'cancelSupport',
						ownid : uni.getStorageSync('user').id,
						otherid : _this.item.uid
					},
					success(res) {
						if(res.result.res.updated === 1 && res.result.res2.updated === 1){
							uni.showToast({
								title : '取消关注成功'
							})
							_this.item.isFollow = false
						}else{
							uni.showToast({
								title : '取消关注失败，请稍后再试',
								icon : 'none'
							})
						}
					},
					fail(res) {
						uni.showToast({
							title : '取消关注失败，请稍后再试',
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
