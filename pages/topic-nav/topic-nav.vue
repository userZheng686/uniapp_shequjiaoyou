<template>
	<view>
		<!--顶部选项卡-->
		<scroll-view scroll-x="true" class="scroll-row border-bottom border-white" :scroll-into-view="scrollInto" style="height: 100rpx;">
			<view
				v-for="(item, index) in tabBars"
				:key="index"
				class="scroll-row-item px-3 px-2 font-md font-weight-bold"
				:id="'tab' + index"
				:class="tabIndex === index ? 'text-main font-lg font-weight-bold' : ''"
				@click="changeTab(index)"
			>
				{{ item.classname }}
			</view>
		</scroll-view>

		<swiper :duration="150" :current="tabIndex" @change="onChangeTab" :style="'height:' + scrollH + 'px;'">
			<swiper-item v-for="(item, index) in newsList" :key="index">
				<scroll-view scroll-y="true" :style="'height:' + scrollH + 'px;'" @scrolltolower="loadmore(index)">
					<template v-if="item.list.length">
						<!--列表-->
						<block v-for="(item2, index2) in item.list" :key="index2">
							<topicList :choose="choose" :item="item2" :index="index2"></topicList>
						</block>
						<!--上拉加载-->
						<loadMore :loadmore="item.loadmore"></loadMore>
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

import topicList from '@/components/news/topic-list.vue'
import loadMore from '@/components/common/load_more.vue';
export default {
	components: {
		topicList,
		loadMore
	},
	data() {
		return {
			title: 'Hello',
			//列表高度
			scrollH: 600,
			//顶部选项卡
			scrollInto: '',
			// 选项卡id
			tabid : '',
			tabIndex: 0,
			tabBars: [
				
			],
			newsList: [],
			choose : false
		};
	},
	// 监听导航栏
	onNavigationBarSearchInputClicked() {
		uni.navigateTo({
			url: '../search/search'
		});
	},
	// 监听导航按钮点击事件
	onNavigationBarButtonTap() {
		uni.navigateTo({
			url:"../add-input/add-input"
		})
	},
	onLoad(e) {
		uni.getSystemInfo({
			success: res => {
				this.scrollH = res.windowHeight - uni.upx2px(100);
			}
		});
		// 获取所有分类
		this.getAllTopic()
		
		if(e.id){
			this.tabid = e.id
		}

		if(e.choose){
			uni.setNavigationBarTitle({
				title : '选择话题'
			})
			this.choose = true
		}
	},
	methods: {
		// 获取所有的分类
		getAllTopic(){
			let _this = this;
			uniCloud.callFunction({
				name : 'get-topic',
				data : {
					action : 'getAllCategory'
				},
				success(res) {
					_this.tabBars = res.result.data
					// 根据选项生成列表
					if(_this.tabid){
						_this.getDataParams()
					}else{
						_this.getData();
					}
					
				}
			})
		},
		// 根据传参的id来获取数据
		getDataParams(){
			let _this = this;
			let arr = [];
			let pageSize = 6;
			if(_this.tabid){
				for(let i=0;i<_this.tabBars.length;i++){
					if(_this.tabBars[i]._id === _this.tabid){
						this.tabIndex = i
						_this.scrollInto = 'tab' + i;
					}
				}
			}
			for(let i=0;i<_this.tabBars.length;i++){
				let obj = {
					// 上拉加载更多
					loadmore: '上拉加载更多',
					loading : true,
					list: []
				};
				if(_this.tabBars[i]._id === _this.tabid){
					uniCloud.callFunction({
						name : 'get-topic',
						data : {
							action : 'getCategoryTopicListFirst',
							id : _this.tabBars[i]._id,
							pageSize
						},
						success(res) {
							if(res.result.data.length > 0){
								if(res.result.data.length < pageSize){
									obj.loadmore = '没有更多了...'
								}else{
									obj.loadmore = '上拉加载更多'
								}
								obj.list = res.result.data.map((item) => {
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
							obj.loading = false
						}
					})
				}
				arr.push(obj)
			}
			_this.newsList = arr
		},
		// 获取话题分类下的列表数据
		getData() {
			let _this = this;
			let arr = [];
			let pageSize = 6;
			for(let i=0;i<this.tabBars.length;i++){
				let obj = {
					// 上拉加载更多
					loadmore: '上拉加载更多',
					loading : true,
					list: []
				};
				uniCloud.callFunction({
					name : 'get-topic',
					data : {
						action : 'getCategoryTopicListFirst',
						id : _this.tabBars[0]._id,
						pageSize
					},
					success(res) {
						if(i<1 && res.result.data.length > 0){
							if(res.result.data.length < pageSize){
								obj.loadmore = '没有更多了...'
							}else{
								obj.loadmore = '上拉加载更多'
							}
							obj.list = res.result.data.map((item) => {
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
					}
				})
				arr.push(obj);
			}
			_this.newsList = arr;
			
		},
		// 切换选项
		changeTab(index) {
			let _this = this;
			if (_this.tabIndex === index) {
				return;
			} else {
				_this.tabIndex = index;
				_this.scrollInto = 'tab' + index;
				if(_this.newsList[index].list.length === 0){
					uniCloud.callFunction({
						name : 'get-topic',
						data : {
							action : 'getCategoryTopicListFirst',
							id : _this.tabBars[index]._id,
							pageSize : 6
						},
						success(res) {
							if(res.result.data.length > 0){
								_this.newsList[index].list = res.result.data.map((item) => {
									return {
										id : item._id,
										cover : item.titlepic,
										title : item.title,
										desc : item.desc,
										today_count : item.todaypost_count,
										news_count : item.post_count
									}
								})	
								if(res.result.data.length < 6){
									_this.newsList[index].loadmore = '没有更多了...'
								}else{
									_this.newsList[index].loadmore = '上拉加载更多'
								}
							}
							_this.newsList[index].loading = false	
						}
					})
				}
			}
		},
		onChangeTab(e) {
			this.changeTab(e.detail.current);
		},
		// 上拉加载更多
		loadmore(index) {
			let _this = this;
			// 拿到当前列表
			let item = _this.newsList[index];
			// 拿到当前话题的id
			let id = _this.tabBars[_this.tabIndex]._id
			// 拿到当前列表的最后一个数据id
			let lastId = item.list[item.list.length - 1].id
			// 设置请求的数据长度
			let pageSize = 6
			// 判断是否处于可加载状态（上拉加载更多）
			if (item.loadmore !== '上拉加载更多') {
				return;
			}
			// 修改当前列表加载状态
			_this.newsList[index].loadmore = '加载中...';
			// 模拟数据请求
			setTimeout(() => {
				// 加载数据
				uniCloud.callFunction({
					name : 'get-topic',
					data : {
						action : 'getCategoryTopicListSecond',
						id : id,
						lastId : lastId,
						pageSize : pageSize
					},
					success(res) {
						// 恢复加载状态
						if(res.result.data < pageSize){
							_this.newsList[index].loadmore = '没有更多了...';
						}else{
							_this.newsList[index].loadmore = '上拉加载更多';
						}
						for(let i=0;i<res.result.data.length;i++){
							let obj = {
								id : res.result.data[i]._id,
								cover : res.result.data[i].titlepic,
								title : res.result.data[i].title,
								desc : res.result.data[i].desc,
								today_count : res.result.data[i].todaypost_count,
								news_count : res.result.data[i].post_count
							}
							item.list.push(obj)
						}
					}
				})
				
			}, 1000);
		}
	}
};
</script>

<style></style>
