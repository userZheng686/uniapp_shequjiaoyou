<template>
	<view>
		<!--tab-->
		<view class="flex align-center" style="height: 100rpx;">
			<view class="flex-1 flex align-center justify-center" 
			v-for="(item,index) in tabBars" :key="index" :class="index === tabIndex ? 'font-lg font-weight-bold  text-main' : 'font-md'"
			@click="changeTab(index)">
				{{item.name}} <text v-if="item.num > 0" class="ml-2">{{item.num}}</text>
			</view>
		</view>
		
		<swiper :duration="150" :current="tabIndex" @change="onChangeTab" :style="'height:' + scrollH + 'px;'">
			<swiper-item v-for="(item, index) in newsList" :key="index">
				<scroll-view scroll-y="true" :style="'height:' + scrollH + 'px;'" @scrolltolower="loadmore(index)">
					<template v-if="item.list.length > 0">
						<!--列表-->
						<block v-for="(items, index2) in item.list" :key="index2">
							<!--列表样式-->
							<userList :item="items" :index="index" @follow="follow"></userList>
						</block>
						<!--上拉加载-->
						<loadMore v-if="item.list.length > 10" :loadmore="item.loadmore"></loadMore>
					</template>
					<template v-else-if="item.loading">
						<loading></loading>
					</template>
					<template v-else>
						<nothing></nothing>
					</template>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	
	import loadMore from '@/components/common/load_more.vue';
	import userList from '../../components/user-list/user-list.vue'
	export default {
		components:{
			loadMore,
			userList
		},
		data() {
			return {
				//列表高度
				scrollH: 600,
				tabIndex : 0,
				tabBars : [{
					name : "互关",
					num : 0
				},{
					name : "关注",
					num : 0
				},{
					name : "粉丝",
					num : 0
				}],
				newsList : []
			}
		},
		onShow() {
			this.formData()
			this.getFollowSupportList()
		},
		onLoad() {
			uni.getSystemInfo({
				success: res => {
					this.scrollH = res.windowHeight - uni.upx2px(100);
				}
			});

			// 根据选项生成列表
			this.formData();
			this.getFollowSupportList()
		},
		// 监听点击输入框事件
		onNavigationBarSearchInputClicked() {
			uni.navigateTo({
				url : '../search/search?type=user'
			})
		},
		onNavigationBarButtonTap() {
			uni.navigateBack({
				delta:1
			})
		},
		methods: {
			// 初始化数据
			formData() {
				let arr = [];
				for (let i = 0; i < this.tabBars.length; i++) {
					// 生成列表数据
					let obj = {
						// 上拉加载更多
						loadmore: '上拉加载更多',
						list: [],
						loading : true
					};
					arr.push(obj);
				}
				this.newsList = arr;
			},
			// 获取粉丝和关注列表
			getFollowSupportList(){
				let _this = this;
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'getFollow',
						id : uni.getStorageSync('user').id
					},
					success(res) {
						let follow = res.result.follow.data
						let fens = res.result.fens.data
						// 处理关注数据
						let followOne = _this.formFollow(res.result.follow.data)
						// 处理互关数据
						follow = _this.formFollowOrFens(follow,'follow')
						fens = _this.formFollowOrFens(fens,'fens')
						
						let beFens = fens.filter((item) => {
							return item.isFollow === true
						})
						
						let beFollow = follow.filter((item) => {
							return item.isFollow === true
						})
						
						if(beFollow.length > 0 && beFens.length > 0){
							_this.newsList[0].list = beFens
							_this.tabBars[0].num = beFens.length
						}
						
						_this.newsList[0].loading = false
						
						_this.newsList[1].list = followOne
						_this.newsList[1].loading = false
						_this.tabBars[1].num = followOne.length
						
						_this.newsList[2].list = fens
						_this.newsList[2].loading = false
						_this.tabBars[2].num = fens.length
						// 互关列表
						
					}
				})
			},
			// 处理关注列表
			formFollow(arr){
				arr = arr.map((item) => {
					return {
						uid : item.user_id,
						avatar : item.userpic,
						username : item.username,
						sex : item.sex, // 0为知 1男性 2女性
						age : item.age,
						isFollow : true
					}
				})
				return arr
			},
			// 处理关注和粉丝列表下 是否互关
			formFollowOrFens(arr,key){
				arr = arr.map((item) => {
					let isFollow = false
					let index = item[key].findIndex((v) => v.userid === uni.getStorageSync('user').id)
					if(index !== -1 ){
						isFollow = true
					}
					return {
						uid : item.user_id,
						avatar : item.userpic,
						username : item.username,
						sex : item.sex, // 0为知 1男性 2女性
						age : item.age,
						isFollow : isFollow
					}
				})
				return arr
			},
			// 取消关注or关注
			follow(item,type){
				// type为true时，表示关注别人
				// type为false时，表示取关别人
				if(type){
					item.isFollow = true
					
					this.newsList[1].list.push(item)
					this.tabBars[1].num = this.newsList[1].list.length
					
					
					
					let beFens = this.newsList[1].list.filter((items) => {
						return items.isFollow === true
					})
					
					let beFollow = this.newsList[2].list.filter((items) => {
						return items.isFollow === true
					})
					
					if(beFollow.length > 0 && beFens.length > 0){
						this.newsList[0].list.push(item)
						this.tabBars[0].num = this.newsList[0].list.length
					}
					
				}else{
					let index = this.newsList[0].list.forEach((v) => v.user_id === item.uid)
					this.newsList[0].list.splice(index,1)
					this.tabBars[0].num = this.newsList[0].list.length
					
					let index2 = this.newsList[1].list.forEach((v) => v.user_id === item.uid)
					this.newsList[1].list.splice(index,1)
					this.tabBars[1].num = this.newsList[1].list.length
					
					let index3 = this.newsList[2].list.forEach((v) => v.user_id === item.uid)
					this.newsList[2].list[index3].isFollow = false
				}
				console.log('item',item,'type',type)
			},
			changeTab(index){
				this.tabIndex = index
			},
			onChangeTab(e) {
				this.changeTab(e.detail.current);
			},
			// 上拉加载更多
			loadmore(index) {
				// 拿到当前列表
				let item = this.newsList[index];
				// 判断是否处于可加载状态（上拉加载更多）
				if (item.loadmore !== '上拉加载更多') {
					return;
				}
				// 修改当前列表加载状态
				this.newsList[index].loadmore = '加载中...';
				// 模拟数据请求
				setTimeout(() => {
					// 加载数据
					item.list = [...item.list, ...item.list];
					// 恢复加载状态
					this.newsList[index].loadmore = '上拉加载更多';
				}, 1000);
			}
		}
	}
</script>

<style>

</style>
