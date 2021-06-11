<template>
	<view>
		<!--导航-->
		<uniNavBar :fixed="true" :border="false" :statusBar="true" @clickRight="openAddInput">
			<view class="flex align-center justify-center font-weight-bold w-100">
				<view
					@click="changeTab(index)"
					:class="tabIndex === index ? 'font-lg text-main' : ''"
					class="font-md text-light-muted mx-1"
					v-for="(item, index) in tabBars"
					:key="index"
				>
					{{ item.name }}
				</view>
			</view>
		</uniNavBar>

		<swiper class="swiper" :current="tabIndex" :duration="150" :style="'height:' + scrollH + 'px;'" @change="onChangeTab">
			<!--关注-->
			<swiper-item >
				<template v-if="list.length > 0">
					<scroll-view scroll-y="true" :style="'height:' + scrollH + 'px;'"
					@scrolltolower="loadmoreEvent">
						<block v-for="(item, index) in list" :key="index">
							<commonList :item="item" :index="index" @doSupport="doSupport"></commonList>
							<divider></divider>
						</block>
						<loadMore :loadmore="loadmore"></loadMore>
					</scroll-view>
				</template>
				<template v-else-if="loading">
					<loading></loading>
				</template>
				<template v-else>
					<nothing></nothing>
				</template>
			</swiper-item>
			<!--话题-->
			<swiper-item>
				<scroll-view scroll-y="true" :style="'height:' + scrollH + 'px;'">
					<!--热门分类-->
					<hotCate :hotCate="hotCate"></hotCate>
					<!--搜索框-->
					<view class="p-2">
						<view class="bg-light rounded flex align-center justify-center py-2 text-secondary"
						@click="openSearch">
							<text class="iconfont icon-sousuo mr-2"></text>
							搜索话题
						</view>
					</view>
					<!--轮播图-->
					<swiper class="px-2 pb-2" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000">
						<swiper-item  v-for="(item,index) in Advertise">
							<image :src="item.src" style="height: 300rpx;" class="w-100 rounded" mode=""></image>
						</swiper-item>
					</swiper>
					<divider></divider>
					<!--最近更新-->
					<view class="p-2 font-md">
						最近更新
					</view>
					<!--话题组件列表-->
					<block v-for="(item,index) in topicList" :key="index">
						<topicList :item="item" :index="index"></topicList>
					</block>
					
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>

import uniNavBar from '@/components/uni-ui/uni-nav-bar/uni-nav-bar.vue';
import commonList from '@/components/common/common_list.vue';
import loadMore from '@/components/common/load_more.vue';
import hotCate from '@/components/news/hot-cate.vue';
import topicList from '@/components/news/topic-list.vue'
export default {
	components: {
		uniNavBar,
		commonList,
		loadMore,
		hotCate,
		topicList
	},
	data() {
		return {
			scrollH: 500,
			tabIndex: 0,
			loading : true,
			tabBars: [{ name: '关注' }, { name: '话题' }],
			// 关注列表
			list: [],
			// 1.上拉加载更多 2.加载中... 3.没有更多了
			loadmore : "上拉加载更多",
			
			hotCate : [],
			Advertise : [],
			topicList : []
		};
	},
	onLoad() {
		uni.getSystemInfo({
			success: res => {
				this.scrollH = res.windowHeight - res.statusBarHeight - 44;
			}
		});
		// 加载关注列表的文章
		this.getFollow();
		// 加载热门分类
		this.getHotTopic();
		// 加载热门广告
		this.getHotAdvertise()
		// 加载热门话题
		this.getHotTopicList();
		
		//监听数组操作
		uni.$on('updateData',(data) => {
			// 取出数组元素下标
			this.list.forEach((item) => {
				if(item._id === data._id){
					item.comment_count = data.comment_count;
					item.support = data.support;
					item.isFollow = data.isFollow;
				}
			})
		});
		
		//监听其他页面的事件
		uni.$on('otherUpdate',(data) => {
			// 取出数组元素下标
			this.list.forEach((item) => {
				if(item._id === data._id){
					item.support = data.support;
				}
			})
		})
	},
	onUnload() {
		uni.$off('updateData')
		uni.$off('otherUpdate')
	},
	onShow() {
		this.loading = true
		this.getFollow()
	},
	methods: {
		// 加载关注列表的文章
		getFollow(){
			let _this = this
			if(uni.getStorageSync('user').id){
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						action : 'getFollowActicleListFirst',
						id : uni.getStorageSync('user').id
					},
					success(res) {
						if(res.result.data.length < 3){
							_this.loadmore = '没有更多了...'
						}else{
							_this.loadmore = '上拉加载更多'
						}
						_this.list = _this.formData(res.result.data)
						_this.loading = false;
					},
					fail(res) {
						_this.loading = false;
					}
				})
			}else{
				this.loading = false
			}
		},
		// 加载热门分类
		getHotTopic(){
			let _this = this;
			uniCloud.callFunction({
				name : 'get-topic',
				data : {
					action : 'getHotCategory'
				},
				success(res) {
					_this.hotCate = res.result.data
				}
			})
		},
		// 加载广告
		getHotAdvertise(){
			let _this = this;
			uniCloud.callFunction({
				name : 'get-topic',
				data : {
					action : 'getHotAdvertise',
					type : 0
				},
				success(res) {
					_this.Advertise = res.result.data
				}
			})
		},
		// 加载热门话题
		getHotTopicList(){
			let _this = this;
			uniCloud.callFunction({
				name : 'get-topic',
				data : {
					action : 'getHotTopicList'
				},
				success(res) {
					_this.topicList = res.result.data.map((item) => {
						return {
							id : item._id,
							cover : item.titlepic,
							title : item.title,
							desc : item.desc,
							today_count : item.todaypost_count,
							news_count : item.post_count
						}
					})
				}
			})
		},
		// 格式化数据
		formData(arr){
			arr = arr.map((item) => {
				//follow为true	
				let obj =  {
					_id : item._id,
					post_class_id : item.post_class_id,
					userid : item.user[0].user_id,
					username: item.user[0].username,
					userpic: item.user[0].userpic,
					newstime: item.create_time,
					isFollow: true,
					title: item.title,
					titlepic: item.titlepic,
					content : item.content,
					support: {
						type: '',
						support_count: item.ding_count,
						unsupport_count: item.cai_count
					},
					comment_count: item.comment_count,
					share_num: item.sharenum,
					content : item.content,
					images:item.images
				}
				
				item.support.forEach((items) => {
					if(items.user_id === uni.getStorageSync('user').id){
						if(items.type === 0){
							obj.support.type = 'support'
						}else{
							obj.support.type = 'unsupport'
						}
					}
				})
				
				return obj
			})
			return arr
		},
		openAddInput() {
			uni.navigateTo({
				url: '../add-input/add-input'
			});
		},
		changeTab(index) {
			this.tabIndex = index;
		},
		// 滑动
		onChangeTab(e){
			console.log(e.detail.current)
			this.tabIndex = e.detail.current
		},
		doSupport(e) {
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
								_this.updateHistory(item)
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
								_this.updateHistory(item)
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
								_this.updateHistory(item)
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
		// 修改历史记录
		updateHistory(item){
			let history = JSON.parse(uni.getStorageSync('history'))
			history.forEach((v) => {
				if(v._id === item._id){
					v.isFollow = item.isFollow
					v.support = item.support
					v.comment = item.comment
					v.share_num = item.share_num
				}
			})
			history = JSON.stringify(history)
			uni.setStorageSync('history',history)
		},
		// 上拉加载
		loadmoreEvent(){
			let _this = this;
			// 判断是否处于加载中
			if(_this.loadmore !== '上拉加载更多'){
				return ;
			}
			// 设置加载更多
			_this.loadmore = '加载中...'
			// 模拟请求
			setTimeout(() => {
				let pageSize = _this.list.length + 2
				// 加载数据
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						action : 'getFollowActicleListSecond',
						id : uni.getStorageSync('user').id,
						pageSize : pageSize
					},
					success(res) {
						if(res.result.data.length < pageSize){
							_this.loadmore = '没有更多了...'
						}else{
							_this.loadmore = '上拉加载更多'
						}
						res.result.data = _this.formData(res.result.data)
						_this.list = res.result.data
					},
					fail(res) {
						console.log(res)
					}
					
				})
			},2000)
		},
		// 搜索框
		openSearch(){
			uni.navigateTo({
				url:'../search/search?type=topic'
			})
		}
	}
};
</script>

<style></style>
