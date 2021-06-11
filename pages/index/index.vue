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
				<scroll-view scroll-anchoring="true"
				:scroll-top="scrollTop"
				 scroll-y="true" :style="'height:' + scrollH + 'px;'"
				 @scrolltolower="loadmore(index)" >
					<template v-if="currentListLength > 0">
						<!--列表-->
						<block v-for="(items, index2) in item.list" :key="index2">
							<common-list :item="items" :pindex="index" :index="index2" @follow="follow" @doSupport="doSupport"></common-list>
							<!--全局分割线-->
							<divider></divider>
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
import commonList from '@/components/common/common_list.vue';
import loadMore from '@/components/common/load_more.vue';
export default {
	components: {
		commonList,
		loadMore
	},
	data() {
		return {
			title: 'Hello',
			//列表高度
			scrollH: 600,
			//顶部选项卡
			scrollInto: '',
			tabIndex: 0,
			tabBars: [],
			newsList: [],
			scrollTop : 0
		};
	},
	// 监听导航栏
	onNavigationBarSearchInputClicked() {
		uni.navigateTo({
			url: '../search/search?type=post'
		});
	},
	// 监听导航按钮点击事件
	onNavigationBarButtonTap() {
		this.navigate({
			url:"../add-input/add-input"
		})
	},
	onShow(){
		if(this.newsList.length > 0){
			this.reloadList();
			this.scrollTop === 0 ? this.scrollTop = 1 : this.scrollTop = 0
		}
		
	},
	onLoad(e) {
		uni.getSystemInfo({
			success: res => {
				this.scrollH = res.windowHeight - uni.upx2px(100);
			}
		});
		// 根据选项生成列表
		this.getCategory();
		// 监听数据操作
		let _this = this;
		//添加新建的文章
		uni.$on('updatelist',(data) => {
			let post_class_id = data.post_class_id;
			let index = 0;
			for(let i=0;i<_this.tabBars.length;i++){
				if(_this.tabBars[i]._id === post_class_id){
					index = i
				}
			};
			let obj = {
				_id:data._id,
				comment_count:data.comment_count,
				content:data.content,
				images:data.images,
				isFollow:true,
				newstime:data.create_time,
				post_class_id:data.post_class_id,
				share_num:0,
				support:data.support,
				title:data.title,
				titlepic:data.titlepic,
				userid:data.user_id,
				username:data.username,
				userpic:data.userpic
			}
			// _this.$set(_this.newsList[index].list,_this.newsList[index].list.length,data)
			_this.newsList[index].list.push(obj)
		})
		// 其他页面关注
		uni.$on('otherUpdate',(data) => {
			// 取出数组元素下标
			_this.newsList.forEach(tab => {
				tab.list.forEach(item => {
					if(item._id === data._id){
						item.support = data.support;
					}
				})
			})
		})
		uni.$on('updateData',(data) => {
			// 取出数组元素下标
			let arrindex1 = data.arrayindex[0];
			let arrindex2 = _this.newsList[arrindex1].list.findIndex(v=>v._id === data._id)
			_this.$set(_this.newsList[arrindex1].list,arrindex2,data)
		});
		// 关注别人
		uni.$on('follow',(id,username,userpic) => {
			uniCloud.callFunction({
				name : 'user-do',
				data : {
					action : 'addSupport',
					user: {
						userid : uni.getStorageSync('user').id
					},
					follow : {
						userid:id,
						username,
						userpic
					}
				},
				success(res){
					_this.newsList.forEach(tab => {
						tab.list.forEach(item => {
							if(item.userid === id){
								item.isFollow = true;
							}
						})
					})
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
		})
	},
	onUnload() {
		uni.$off('updateData')
		uni.$off('follow')
		uni.$off('otherUpdate')
		uni.$off('updatelist')
	},
	computed:{
		currentListLength(){
			return this.newsList[this.tabIndex].list.length
		}
	},
	methods: {
		// 获取数据
		getCategory() {
			let _this = this;
			//获取分类
			uniCloud.callFunction({
				name: 'get-article',
				data : {
					action : 'category'
				},
				async success(res) {
					_this.tabBars = Array.from(res.result.data)
					let data = {
						action : 'listone',
						id : _this.tabBars[0]._id
					}
					let list = await _this.getArticleList(data);
					let arr = []
					for (let i = 0; i < _this.tabBars.length; i++) {
						// 生成列表数据
						let obj = {
							// 上拉加载更多
							loadmore: '上拉加载更多',
							list: [],
							loading : true
						};
						if (i < 1) {
							if(list.length < 3){
								obj.loadmore = '没有更多了...'
							}
							obj.list = list;
							obj.loading = false
						}
						arr.push(obj);
					}
					_this.newsList = arr;
				}
			})
		},
		getArticleList(data){
			return new Promise((resolve,reject) => {
				uniCloud.callFunction({
					name: 'get-article',
					data,
					success(res) {						
						let r = res.result.data.map((item) => {
							//先找出fens字段 然后判断是否关注了
							let follow = false;
							let fens = item.user[0].fens
							if(item.user_id === uni.getStorageSync('user').id){
								follow = true
							}else{
								for(let i=0;i<fens.length;i++){
									if(fens[i].userid === uni.getStorageSync('user').id){
										follow = true
									}
								}
							}
							let obj = {
								_id : item._id,
								post_class_id : item.post_class_id,
								userid : item.user[0].user_id,
								username: item.user[0].username,
								userpic: item.user[0].userpic,
								newstime: item.create_time,
								isFollow: follow,
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
						resolve(r)
					},
					fail(res) {
						reject(res)
					}
				})
			})	
		},
		follow(index) {
			let _this = this;
			_this.checkAuth(() => {
				let user = _this.newsList[_this.tabIndex].list[index]
				_this.updateHistory(user)
				uni.$emit('follow',user.userid,user.username,user.userpic)
			})
		},
		doSupport(e) {
			let _this = this;
			this.checkAuth(() => {
				let item = _this.newsList[this.tabIndex].list[e.index]
				let msg = e.type === "support" ? "点赞" : "反对";
				if (item.support.type === '') {
					item.support.type = e.type;
					item.support[e.type + '_count']++;
					let user = {
						user_id : uni.getStorageSync('user').id,
						post_id : item.post_class_id,
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
									title: msg + "失败",
									icon : 'none'
								})
							}
						},
						fail() {
							uni.showToast({
								title: msg + "失败",
								icon : 'none'
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
									title: msg + "失败",
									icon : 'none'
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
									title: msg + "失败",
									icon : 'none'
								})
							}
						},
						fail() {
							uni.showToast({
								title: msg + "失败",
								icon : 'none'
							})
						}
					})
				}
				item.support.type = e.type;
				uni.$emit('otherUpdate',item)
			})
		},
		// 重新加载数据(根据tabid)
		async reloadList(){
			let data = {
				action : 'listone',
				id : this.tabBars[this.tabIndex]._id
			}
			let list = await this.getArticleList(data)
			if(list.length < 3){
				this.newsList[this.tabIndex].loadmore = '没有更多了...'
			}else{
				this.newsList[this.tabIndex].loadmore = '上拉加载更多'
			}
			this.newsList[this.tabIndex].list = list
			this.newsList[this.tabIndex].loading = false
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
		// 切换选项
		async changeTab(index) {
			let _this = this;
			if (_this.tabIndex === index) {
				return;
			} else {
				_this.tabIndex = index;
				_this.scrollInto = 'tab' + index;
				let data = {
					action : 'listone',
					id : _this.tabBars[_this.tabIndex]._id
				}
				// 判断是否加载过了
				if(_this.newsList[_this.tabIndex].list.length === 0){
					if(await _this.getArticleList(data).length === 0){
						_this.newsList[_this.tabIndex].loading = false
					}else{
						let list = await _this.getArticleList(data)
						if(list.length < 3){
							_this.newsList[_this.tabIndex].loadmore = '没有更多了...'
						}else{
							_this.newsList[_this.tabIndex].loadmore = '上拉加载更多'
						}
						_this.newsList[_this.tabIndex].list = list
						_this.newsList[_this.tabIndex].loading = false
					}
				}
			}
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
			setTimeout(async () => {
				// 加载数据
				let data = {
					action : 'listafter',
					id : this.newsList[index].list.slice(-1)[0].post_class_id,
					lastId : this.newsList[index].list.slice(-1)[0]._id
				}
				let res = await this.getArticleList(data);
				if(res.length != 0 ){
					item.list = [...item.list, ...res];
					if(res.length < 3){
						this.newsList[index].loadmore = '没有更多了...';
					}else{
						// 恢复加载状态
						this.newsList[index].loadmore = '上拉加载更多';
					}
					
				}else{
					this.newsList[index].loadmore = '没有更多了...';
				}
				
			}, 1000);
		}
	}
};
</script>

<style></style>
