<template>
	<view>
		<template v-if="list.length === 0">
			<view class="py-2 font-md px-2">
				暂无搜索历史
			</view>
		</template>
		<template v-else-if="searchList.length === 0">
			<!--搜索历史-->
			<view class="py-2 font-md px-2">
				搜索历史
			</view>
			<view class="flex flex-wrap">
				<view 
				hover-class="bg-light"
				@click="clickSearchHistory(item)"
				class="border rounded font mx-2 my-1 px-2" v-for="(item,index) in list" :key
				="index">
					{{item}}
				</view>
			</view>
		</template>
		<template v-else-if="searchList.length > 0">
			<scroll-view scroll-anchoring="true"
			 scroll-y="true" :style="'height:' + scrollH + 'px;'"
			 @scrolltolower="loadMore()" >
				<!--数据列表-->
				<block v-for="(item,index) in searchList" :key="index">
					<template v-if="type === 'post'">
						<common-list :item="item" :index="index" @follow="follow" @doSupport="doSupport"></common-list>
					</template>
					<template v-else-if="type === 'topic'">
						<topicList :item="item" :index="index"></topicList>
					</template>
					<template v-else>
						<userList :item="item" :index="index"></userList>
					</template>
				</block>
				<loadMore :loadmore="loadmore"></loadMore>
			</scroll-view>
		</template>
		
	</view>
</template>

<script>

	import loadMore from '@/components/common/load_more.vue';
	import commonList from '@/components/common/common_list.vue';
	import topicList from '../../components/news/topic-list.vue';
	import userList from '../../components/user-list/user-list.vue';
	export default {
		components:{
			commonList,topicList,userList,loadMore
		},
		data() {
			return {
				searchText : '',
				list : [],
				// 请求结果
				searchList : [],
				//列表高度
				scrollH: 600,
				// 搜索类型
				type : "post",
				timer : null,
				loadmore : ''
			}
		},
		onUnload() {
			uni.$off('updateData')
		},
		onLoad(e) {
			// 获取本地历史记录
			this.getSearchHistory()
			
			uni.$on('updateData',(data) => {
				if(this.searchList.length > 0){
					this.searchList.forEach((v) => {
						if(v._id === data._id){
							v.support = data.support
							v.comment_count = data.comment_count
							v.share_num = data.share_num
						}
					})
				}
			})
			
			this.type = ''
			if(e.type){
				this.type = e.type
			}
			let pageTitle = '帖子'
			switch(this.type){
				case 'post' : pageTitle = '帖子' ; break;
				case 'topic' : pageTitle = '话题' ; break;
				case 'user' : pageTitle = '用户' ; break;
			}
			// 修改搜索占位
			// #ifdef H5
			this.$nextTick(() => {
				let input = document.getElementsByClassName('uni-page-head-search-placeholder-center')[0]
				input.innerText ? input.innerText = '搜索' + pageTitle : ''
			})			
			// #endif
			
			// #ifdef APP-PLUS
			let currentWebview = this.$mp.page.$getAppWebview();
			let tn = currentWebview.getStyle().titleNView;
			tn.searchInput.placeholder = '搜索' + pageTitle;
			currentWebview.setStyle({
				titleNView:tn
			})
			// #endif
			
		},
		onNavigationBarButtonTap(e) {
			if(e.index === 0){
				this.searchEvent()
			}
		},
		onBackPress(e){
			if(this.searchList.length != 0){
				this.searchText = '';
				this.loadmore = ''
				this.searchList = [];
				return true;
			}
		},
		onNavigationBarSearchInputConfirmed(e){
			this.searchText = e.text
			this.searchEvent()
		},
		onNavigationBarSearchInputChanged(e) {
			if(this.timer !== null){
				clearTimeout(this.timer)
			}
			
			this.timer = setTimeout(() => {
				this.searchText = e.text
			},1000)
			
		},
		methods: {
			// 获取本地历史记录
			getSearchHistory(){
				let searchHistory = uni.getStorageSync('searchHistory')
				if(searchHistory && JSON.parse(searchHistory) !== ""){
					this.list = JSON.parse(searchHistory)
				}
			},
			// 点击历史搜索事件
			clickSearchHistory(text){
				this.searchText = text
				this.searchEvent()
			},
			// 搜索事件
			searchEvent(){
				// 请求搜索
				uni.hideKeyboard()
				if(this.searchText == false){
					uni.showToast({
						title : '请输入内容',
						icon : 'none'
					})
				}else{
					// 处于loading状态
					uni.showLoading({
						title: '加载中',
						mask:false
					})
					let searchHistory = uni.getStorageSync('searchHistory')
					if(searchHistory  && JSON.parse(searchHistory) !== ""){
						searchHistory = JSON.parse(searchHistory)
						let index = searchHistory.findIndex((v) => v === this.searchText)
						if(index === -1){
							searchHistory.push(this.searchText)
							uni.setStorageSync('searchHistory',JSON.stringify(searchHistory))
						}
					}else{
						this.list.push(this.searchText)
						let searchHistory = this.list
						uni.setStorageSync('searchHistory',JSON.stringify(searchHistory))
					}
					
					// 请求搜索
					setTimeout(() => {
						switch(this.type){
							case 'post' : this.searchPosting(); break;
							case 'topic' : this.searchTopic(); break;
							case 'user' : this.searchUser(); break;
						}
						
						// 隐藏loading
						uni.hideLoading()
					},2000)
				}
			},
			// 帖子数据整理
			formPostingData(arr){
				arr = arr.map((item) => {
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
				return arr
			},
			// 帖子搜索
			searchPosting(){
				let _this = this;
				uniCloud.callFunction({
					name : 'search',
					data : {
						action : 'searchPosting',
						content : _this.searchText,
						pageSize : 3
					},
					success(res) {
						if(res.result.data.length === 0){
							_this.searchList = [];
							uni.showToast({
								title : '暂时没找到记录，请确认关键词是否无误?',
								icon : 'none'
							})
						}else{
							if(res.result.data.length < 3){
								_this.loadmore = '没有更多了...'
							}else{
								_this.loadmore = '上拉加载更多'
							}
							_this.searchList = _this.formPostingData(res.result.data)		
						}			
					},
					fail() {
						uni.showToast({
							title : '暂时没找到记录，请确认关键词是否无误?',
							icon : 'none'
						})
					}
				})
			},
			// 关注
			follow(index) {
				let _this = this;
				_this.checkAuth(() => {
					let item = _this.searchList[index]
					uniCloud.callFunction({
						name : 'user-do',
						data : {
							action : 'addSupport',
							user: {
								userid : uni.getStorageSync('user').id
							},
							follow : {
								userid:item.userid,
								username:item.username,
								userpic:item.userpic
							}
						},
						success(res){
							_this.updateHistory(item)
							_this.searchList.forEach((v) => {
								if(v.userid === item.userid){
									v.isFollow = true
								}
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
			// 点赞或者踩
			doSupport(e) {
				let _this = this;
				this.checkAuth(() => {
					let item = _this.searchList[e.index]
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
			// 搜索话题
			searchTopic(){
				let _this = this;
				uniCloud.callFunction({
					name : 'search',
					data : {
						action : 'searchTopic',
						content : _this.searchText,
						pageSize : 3
					},
					success(res) {
						if(res.result.data.length === 0){
							_this.searchList = [];
							uni.showToast({
								title : '暂时没找到记录，请确认关键词是否无误?',
								icon : 'none'
							})
						}else{
							_this.searchList = _this.formTopicData(res.result.data)	
						}				
					},
					fail() {
						uni.showToast({
							title : '暂时没找到记录，请确认关键词是否无误?',
							icon : 'none'
						})
					}
				})
			},
			// 格式化话题
			formTopicData(arr){
				arr = arr.map((item) => {
					return {
						id : item._id,
						cover : item.titlepic,
						title : item.title,
						desc : item.desc,
						today_count : item.todaypost_count,
						news_count : item.post_count
					}
				})
				return arr
			},
			// 搜索用户
			searchUser(){
				let _this = this;
				uniCloud.callFunction({
					name : 'search',
					data : {
						action : 'searchUser',
						content : _this.searchText,
						pageSize : 3
					},
					success(res) {
						if(res.result.data.length === 0){
							_this.searchList = [];
							uni.showToast({
								title : '暂时没找到记录，请确认关键词是否无误?',
								icon : 'none'
							})
						}else{
							_this.searchList = _this.formUserData(res.result.data)	
						}				
					},
					fail(res) {
						
						uni.showToast({
							title : '暂时没找到记录，请确认关键词是否无误?',
							icon : 'none'
						})
					}
				})
			},
			// 格式化用户数据
			formUserData(arr){
				arr = arr.map((item) => {
					let follow = false;
					let fens = item.fens
					let index = fens.findIndex((v) => v.userid === uni.getStorageSync('user').id)
					if(index !== -1 ){
						follow = true
					}
					
					return {
						userpic : item.userpic,
						uid : item.user_id,
						avatar : item.userpic,
						username : item.username,
						sex : item.sex, // 0为知 1男性 2女性
						age : item.age,
						isFollow : follow
					}
				})
				return arr
			},
			// 往下滑动
			loadMore(){
				// 拿到当前列表
				let item = this.searchList[this.searchList.length-1];
				// 判断是否处于可加载状态（上拉加载更多）
				if (this.loadmore !== '上拉加载更多') {
					return;
				}
				// 修改当前列表加载状态
				this.loadmore = '加载中...';
				// 模拟数据请求
				setTimeout(async () => {  
					switch(this.type){
						case 'post' : {
							let res = await this.loadingMoreData('searchPosting',this.searchList.length+3,'')
							if(res.length < this.searchList.length+3){
								this.loadmore = '没有更多了...'
							}else{
								this.loadmore = '上拉加载更多'
							}
							this.searchList = res
							break;
						};
						case 'topic' : {
							let res = await this.loadingMoreData('searchTopicSecond',this.searchList.length+3,this.searchList[this.searchList.length-1]._id)
							if(res.length < 3){
								this.loadmore = '没有更多了...'
							}else{
								this.loadmore = '上拉加载更多'
							}
							this.searchList = [...this.searchList,...res]
							break;
						};
						case 'user' : {
							break;
						};
					}
				})
			},
			// 加载更多数据（根据搜索条件）
			loadingMoreData(action,pageSize,lastId){
				let _this = this;
				return new Promise((resolve,reject) => {
					uniCloud.callFunction({
						name : 'search',
						data : {
							action : action,
							content : _this.searchText,
							pageSize : pageSize,
							lastId : lastId
						},
						success(res) {
							if(res.result.data.length > 0){
								switch(action){
									case 'searchPosting' : {
										res.result.data = _this.formPostingData(res.result.data)
										resolve(res.result.data)
										break;
									};
									case 'searchTopicSecond' : {
										res.result.data = _this.formTopicData(res.result.data)
										resolve(res.result.data)
										break;
									};
								}
							}else{
								reject([])
							}
						},
						fail(){
							reject([])
						}
					})
				})
				
			}
		},
	}
</script>

<style>

</style>
