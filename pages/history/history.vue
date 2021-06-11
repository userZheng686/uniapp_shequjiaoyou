<template>
	<view>
		<template v-if="list.length > 0">
			<block v-for="(item,index) in list" :key="index">
				<common-list :item="item" :index="index" @doSupport="doSupport" @follow="follow"></common-list>
			</block>
		</template>
		<template v-else-if="loading">
			<loading></loading>
		</template>
		<template v-else>
			<nothing></nothing>
		</template>
	</view>
</template>

<script>
	import CommonList from '../../components/common/common_list.vue'
	export default {
		components:{
			CommonList
		},
		onLoad() {
			this.getHistory()
		},
		onShow(){
			this.getHistory()
		},
		data() {
			return {
				list : [],
				loading : true
			}
		},
		onNavigationBarButtonTap() {
			let _this = this;
			uni.showModal({
				content : '是否要清除历史记录',
				success(res) {
					if(res.confirm){
						uni.removeStorageSync('history');
						_this.list = [];
					}
				}
			})
		},
		methods: {
			getHistory(){
				let list = uni.getStorageSync('history')
				if(list){
					this.list = JSON.parse(list)
				}
				this.loading = false
			},
			doSupport(e){
				let _this = this;
				this.checkAuth(() => {
					let item = _this.list[e.index]
					let msg = e.type === "support" ? "点赞" : "反对";
					if (item.support.type === '') {
						item.support.type = e.type;
						item.support[e.type + '_count']++;
						let user = {
							user_id : uni.getStorageSync('user').id,
							post_id : item.id,
							type : e.type === 'support' ? 0 : 1,
							create_time : new Date().getTime()
						}
						uniCloud.callFunction({
							name : "get-article",
							data : {
								action : 'firstStarOrUnstar',
								id : item._id,
								support_count : item.support.support_count,
								unsupport_count : item.support.unsupport_count,
								user
							},
							success(res) {
								if(res.result.updated === 1){
									uni.showToast({
										title: msg + "成功"
									})
								}else{
									uni.showToast({
										title: msg + "失败"
									})
								}
							},
							fail() {
								uni.showToast({
									title: msg + "失败"
								})
							}
						})
					}
					else if (item.support.type === 'support' && e.type === 'unsupport') {
						item.support.support_count--;
						item.support.unsupport_count++;
						uniCloud.callFunction({
							name : 'get-article',
							data : {
								action : 'unStarArticle',
								id : item._id,
								support_count : item.support.support_count,
								unsupport_count : item.support.unsupport_count
							},
							success(res) {
								if(res.result.updated === 1){
									uni.showToast({
										title: msg + "成功"
									})
								}else{
									uni.showToast({
										title: msg + "失败"
									})
								}
							},
							fail() {
								uni.showToast({
									title: msg + "失败"
								})
							}
						})
					} else if (item.support.type === 'unsupport' && e.type === 'support') {
						item.support.support_count++;
						item.support.unsupport_count--;
						uniCloud.callFunction({
							name : 'get-article',
							data : {
								action : 'starArticle',
								id : item._id,
								support_count : item.support.support_count,
								unsupport_count : item.support.unsupport_count
							},
							success(res) {
								if(res.result.updated === 1){
									uni.showToast({
										title: msg + "成功"
									})
								}else{
									uni.showToast({
										title: msg + "失败"
									})
								}
							},
							fail() {
								uni.showToast({
									title: msg + "失败"
								})
							}
						})
					}
					item.support.type = e.type;
					uni.$emit('otherUpdate',item)
				})
			},
			follow(index){
				let _this = this;
				_this.checkAuth(() => {
					let user = _this.list[index]
					uni.$emit('follow',user.userid,user.username,user.userpic)
				})
			}
		}
	}
</script>

<style>

</style>
