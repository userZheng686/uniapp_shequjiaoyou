<template>
	<view>
		<topicInfo :info="info"></topicInfo>
		<divider></divider>
		
		<view class="p-2 flex align-center border-bottom" 
		hover-class="bg-light" v-for="(item,index) in hotList" :key="index">
			<text class="iconfont icon-xuanze text-main"></text>
			<text class="font text-dark text-ellipsis">
				{{item.title}}
			</text>
		</view>
		
		<divider></divider>
		
		<!--tab-->
		<view class="flex align-center py-2">
			<view class="flex-1 flex align-center justify-center" 
			v-for="(item,index) in tabBars" :key="index" :class="index === tabIndex ? 'font-lg font-weight-bold  text-main' : 'font-md'"
			@click="changeTab(index)">{{item.name}}</view>
			
		</view>
		
		<!--列表-->
		<template v-if="listData.length > 0">
			<block v-for="(item,index) in listData" :key="index">
				<commonList :item="item" :index="index" @follow="follow" @doSupport="doSupport"></commonList>
				<divider></divider>
			</block>
			<!--上拉加载-->
			<loadMore :loadmore="loadtext"></loadMore>
		</template>
		<template v-else-if="this.loading">
			<loading></loading>
		</template>
		<template v-else>
			<noThing></noThing>
		</template>
		
		
	</view>
</template>

<script>	
	import topicInfo from '../../components/topic-detail/topic-info.vue';
	import commonList from '../../components/common/common_list.vue';
	import noThing from '../../components/common/no-thing.vue';
	import loadMore from '../../components/common/load_more.vue';
	export default {
		components:{
			topicInfo,
			commonList,
			noThing,
			loadMore
		},
		data() {
			return {
				info : {
					
				},
				hotList : [{
					title : " 【新人必读】uni-app"
				},{
					title : " 【新人必读】uni-app2"
				}],
				tabIndex : 0,
				tabBars : [{
					name : "默认"
				},{
					name : "最新"
				}],
				// 默认
				list1 : [],
				loadtext1 : "上拉加载更多",
				loading1 : true,
				// 最新
				list2 : [],
				loadtext2 : "上拉加载更多",
				loading2 : true,
			}
		},
		computed:{
			listData(){
				if(this.tabIndex === 0){
					return this.list1
				}else{
					return this.list2
				}
			},
			loading(){
				if(this.tabIndex === 0){
					return this.loading1
				}else{
					return this.loading2
				}
			},
			loadtext(){
				if(this.tabIndex === 0){
					return this.loadtext1
				}else{
					return this.loadtext2
				}
			}
		},
		onLoad(e) {
			if(e.detail){
				let res = JSON.parse(e.detail)
				this.info = res
			}
			this.getTopicList()
			let _this = this;
			uni.$on('updateData',(data) => {
				if(_this.list1.length > 0){
					_this.list1.forEach((item) => {
						if(item._id === data._id){
							item.comment_count = data.comment_count;
							item.support = data.support;
							item.isFollow = data.isFollow;
						}
					})
				}
				if(_this.list2.length > 0){
					_this.list2.forEach((item) => {
						if(item._id === data._id){
							item.comment_count = data.comment_count;
							item.support = data.support;
							item.isFollow = data.isFollow;
						}
					})
				}
			});
			
			uni.$on('otherUpdate',(data) => {
				if(_this.list1.length > 0){
					_this.list1.forEach((item) => {
						if(item._id === data._id){
							item.comment_count = data.comment_count;
							item.support = data.support;
							item.isFollow = data.isFollow;
						}
					})
				}
				if(_this.list2.length > 0){
					_this.list2.forEach((item) => {
						if(item._id === data._id){
							item.comment_count = data.comment_count;
							item.support = data.support;
							item.isFollow = data.isFollow;
						}
					})
				}
			})
			
			uni.$on('follows',(id,username,userpic) => {
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
						if(_this.list1.length > 0){
							_this.list1.forEach((item) => {
								if(item.userid === id){
									item.isFollow = true;
									_this.updateHistory(item)
								}
							})
						}
						if(_this.list2.length > 0){
							_this.list2.forEach((item) => {
								if(item.userid === id){
									item.isFollow = true;
									_this.updateHistory(item)
								}
							})
						}
						
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
		// 滚动到底部
		onReachBottom(){
			this.loadmore()
		},
		onUnload() {
			uni.$off('follows')
			uni.$off('updateData')
			uni.$off('otherUpdate')
		},
		methods: {
			changeTab(index){
				let _this = this;
				let pageSize = 2;
				_this.tabIndex = index
				if(index===1 && _this.list2.length === 0){
					uniCloud.callFunction({
						name : 'get-article',
						data : {
							action : 'getTopicArticleListFirstTime',
							id : _this.info.id,
							pageSize : pageSize
						},
						success(res) {
							if(res.result.data.length < pageSize){
								_this.loadtext2 = '没有更多了...'
							}else{
								_this.loadtext2 = '上拉加载更多'
							}
							
							_this.list2 = _this.formData(res.result.data)
							_this.loading2 = false
						}
					})	
				}
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
			// 关注
			follow(index) {
				let _this = this;
				_this.checkAuth(() => {
					let user= {};
					if(_this.tabIndex === 0){
						user = _this.list1[index]
					}else{
						user = _this.list2[index]
					}
					uni.$emit('follows',user.userid,user.username,user.userpic)
				})
			},
			// 点赞或踩
			doSupport(e) {
				let item = {};
				let item2 = {};
				let _this = this;
				if(this.tabIndex === 0){
					item = this.list1[e.index]
					if(this.list2.length > 0){
						for(let i=0;i<this.list2.length;i++){
							if(this.list2[i]._id === item._id){
								item2 = this.list2[i]
							}
						}
					}
				}else{
					item = this.list2[e.index];
					if(this.list2.length > 0){
						for(let i=0;i<this.list2.length;i++){
							if(this.list2[i]._id === item._id){
								item2 = this.list2[i]
							}
						}
					}
				}
				let msg = e.type === "support" ? "点赞" : "反对";
				if (item.support.type === '') {
					item.support.type = e.type;
					item.support[e.type + '_count']++;
					if(Object.keys(item2).length){
						item2.support.type = e.type;
						item2.support[e.type + '_count']++
					}
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
					if(Object.keys(item2).length){
						item2.support.support_count--;
						item2.support.unsupport_count++;
					}
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
					if(Object.keys(item2).length){
						item2.support.support_count++;
						item2.support.unsupport_count--
					}
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
				if(Object.keys(item2).length){
					item2.support.type = e.type
				}
			},
			// 格式化数据
			formData(arr){
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
					
					let obj =  {
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
			// 获取对应的话题下的文章列表
			getTopicList(){
				let _this = this;
				let pageSize = 2;
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						action : 'getTopicArticleListFirst',
						id : _this.info.id,
						pageSize : pageSize
					},
					success(res) {
						if(res.result.data.length < pageSize){
							_this.loadtext1 = '没有更多了...'
						}else{
							_this.loadtext1 = '上拉加载更多'
						}
						
						_this.list1 = _this.formData(res.result.data)
						_this.loading1 = false
					}
				})
			},
			// 默认上拉加载
			getDefaultLoadmore(){
				let _this = this;
				let pageSize = 2;
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						action : 'getTopicArticleListSecond',
						id : _this.info.id,
						lastId : _this.list1[_this.list1.length-1]._id,
						pageSize : pageSize
					},
					success(res) {
						res.result.data = _this.formData(res.result.data)
						for(let i=0;i<res.result.data.length;i++){
							_this.list1.push(res.result.data[i])
						}
						if(res.result.data.length < pageSize){
							_this.loadtext1 = '没有更多了...'
						}else{
							_this.loadtext1 = '上拉加载更多'
						}
					}
				})
			},
			// 最新上拉加载
			getNewLoadmore(){
				let _this = this;
				let pageSize = 2 + _this.list2.length;
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						action : 'getTopicArticleListSecondTime',
						id : _this.info.id,
						pageSize : pageSize
					},
					success(res) {
						res.result.data = _this.formData(res.result.data)
						_this.list2 = res.result.data
						if(res.result.data.length < pageSize){
							_this.loadtext2 = '没有更多了...'
						}else{
							_this.loadtext2 = '上拉加载更多'
						}
					},
					fail(res) {
						console.log(res)
					}
				})
			},
			// 上拉加载更多
			loadmore(){
				// 拿到当前列表
				let index = this.tabIndex
				// 判断是否处于可加载状态
				if(this.loadtext !== '上拉加载更多'){
					return ;
				}
				// 设置上来加载状态处于加载中
				if(index === 0){
					this.loadtext1 = '加载中'
				}else{
					this.loadtext2 = '加载中'
				}
				// 请求数据
				setTimeout(() => {
					if(index === 0){
						this.getDefaultLoadmore()
					}else{
						this.getNewLoadmore()
					}
				},1000)
			}
		}
	}
</script>

<style>

</style>
