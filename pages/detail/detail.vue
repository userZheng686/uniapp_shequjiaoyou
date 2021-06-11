<template>
	<view style="overflow: hidden;">
		<!--帖子详情页详情信息-->
		<commonList :item="info" isdetail
		@doSupport="doSupport"
		@follow="follow" @doComment="doComment" @doShare="doShare">
			<view class="">
				{{info.content}}
			</view>
			<view class="">
				<image v-for="(item,index) in info.images" @click="preview(index)"
				:src="item" class="w-100" mode="widthFix"></image>
			</view>
		</commonList>
		
		<divider></divider>
		

		
		
		<template v-if="comment.length > 0">
			<view class="p-2 font-md font-weight-bold">
				最新评论 {{info.comment_count}}
			</view>
			<block v-for="(item,index) in comment" :key="index">
				<view class="p-2 uni-comment-list" >
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
						<view class="uni-comment-content" @click="replyComment(item.id,item.fid,item.user.username)">{{item.data}}</view>
					</view>
				</view>
				<detailList style="margin-left: 92rpx;padding-left:15rpx;background-color: rgba(244,244,244,0.5);" :data="item.children" ></detailList>
			</block>
		</template>
		<template v-else-if="loading">
			<loading></loading>
		</template>
		<template v-else>
			<view class="font-md flex justify-center align-center">还没有评论呢，赶快留下你的评论吧</view>
		</template>
		
		
		
		<view class="" style="height: 100rpx;"></view>
		<!--发送框-->
		<bottomInput @submit="submit" :focus="focus" @blur="blur"></bottomInput>
		
		<moreShare ref="share" :title="info.title" :shareText="info.content" :image="info.titlepic"></moreShare>
	</view>
</template>

<script>
	import $T from '@/common/css/time.js'
	import commonList from '../../components/common/common_list.vue';
	import bottomInput from '../../components/common/bottom-input.vue';
	import moreShare from '../../components/common/more-share.vue';
	import detailList from '../../components/common/detail-list.vue';
	export default {
		components:{
			commonList,
			bottomInput,
			moreShare,
			detailList
		},
		// 过滤器
		filters:{
			formatTime(value){
				 return $T.gettime(value); 
			}
		},
		provide() {
			return {
				replyFunction : this.replyComment
			}
		},
		data() {
			return {
				// 当前帖子信息
				info : {
					
				},
				comment : [],
				loading : true,
				focus : false,
				replyId : null,
				replyUsername : ''
			}
		},
		onLoad(e) {
			// 初始化
			if(e.detail){
				this.init(JSON.parse(e.detail))
				this.getComment();
			}
		},
		computed:{
			imagesList(){
				return this.info.images.map(item => item)
			}
		},
		onNavigationBarButtonTap() {
			this.$refs.share.open()
		},
		onBackPress() {
			this.$refs.share.close()
		},
		methods: {
			init(data){
				// 修改标题
				uni.setNavigationBarTitle({
					title : data.title
				})
				// 请求api
				this.info = data
			},
			// 获取评论
			getComment(){
				let _this = this
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						id : _this.info._id,
						action : 'comment'
					},
					success(res) {
						if(res.result.data.length){
							let list = res.result.data[0].list;
							list = _this.buildTree(list,'id','fid')
							_this.comment = list
							_this.info.comment_count = res.result.data[0].list.length
						}
						
						_this.loading = false
					},
					fail() {
						_this.loading = false
					}
				})
			},
			buildTree(array,id,parent_id) {
			    
			    // 创建临时对象
			    let temp = {};
			    // 创建需要返回的树形对象
			    let tree = {};
			    // 先遍历数组，将数组的每一项添加到temp对象中
			    for(let j in array) {
					array[j].children = [];
					temp[array[j][id]] = array[j];
				}
			
			
			    // 遍历temp对象，将当前子节点与父节点建立连接
				for(let i in temp) {
				   // 判断是否是根节点下的项
				   if(temp[i][parent_id] !== 0) {
					   temp[temp[i][parent_id]].children.push(temp[i]);
				   } else {
					   tree[temp[i][id]] = temp[i];
				   }
			    }
				
				tree = Object.keys(tree).map((item,index) => {return tree[item]})
			    tree = this.treeSort(tree)
				return tree;
			},
			// 递归排序
			treeSort(arr){
				arr = arr.sort((a,b) => {
					return a.create_time < b.create_time ? -1 : 1
				})
				for(let i = 0;i<arr.length;i++){
					if(arr[i].children.length > 0){
						arr[i].children = arr[i].children.sort((a,b) => {
							return a.create_time < b.create_time ? -1 : 1
						})
					}
				}
				return arr
			},
			// 评论
			doComment(){},
			// 分享
			doShare(){},
			// 修改历史记录 根据id
			updateHistoryId(id,comment_count){
				let history = JSON.parse(uni.getStorageSync('history'))
				history.forEach((v) => {
					if(v._id === id){
						v.comment_count = comment_count
					}
				})
				history = JSON.stringify(history)
				uni.setStorageSync('history',history)
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
			// 修改历史记录 关注
			updateHistoryFollow(item){
				let history = JSON.parse(uni.getStorageSync('history'))
				history.forEach((v) => {
					if(v._id === item._id){
						v.isFollow = item.isFollow
					}
				})
				history = JSON.stringify(history)
				uni.setStorageSync('history',history)
			},
			// 关注
			follow(){
				this.info.isFollow = true
				this.updateHistoryFollow(this.info)
				uni.$emit('follow',this.info.userid)
				uni.showToast({
					title : '关注成功'
				})
			},
			// 顶踩操作
			doSupport(e){
				let item = this.info;
				let _this = this;
				if(this.info.support.type === e.type){
					return uni.showToast({
						title : '你已经操作过了',
						icon : 'none'
					})
				}
				let msg = e.type === "support" ? "点赞" : "反对";
				if (item.support.type === '') {
					item.support.type = e.type;
					item.support[e.type + '_count']++;
					let user = {
						type : e.type === 'support' ? 0 : 1,
						user_id : JSON.parse(uni.getStorageSync('userinfo')).user_id,
						username : JSON.parse(uni.getStorageSync('userinfo')).username,
						userpic : JSON.parse(uni.getStorageSync('userinfo')).userpic
					}
					uniCloud.callFunction({
						name : "get-article",
						data : {
							action : 'firstStarOrUnstar',
							id : item._id,
							support_count : item.support.support_count,
							unsupport_count : item.support.unsupport_count,
							user : user
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
				uni.$emit('updateData',item)
			},
			// 预览功能
			preview(index){
				// 预览图片
				uni.previewImage({
					current:index,
					urls: this.imagesList,
				});
			},
			// 提交
			submit(data){
				let _this = this;
				_this.checkAuth(() => {
					let user = {
						userid : JSON.parse(uni.getStorageSync('userinfo')).user_id,
						username : JSON.parse(uni.getStorageSync('userinfo')).username,
						userpic : JSON.parse(uni.getStorageSync('userinfo')).userpic
					}
					uni.showLoading({
						title : '正在发送中，请稍后'
					})
					let replyData = {
						id : Math.round(Math.random()*10000),
						fid : _this.replyId ? _this.replyId : 0,
						user_id : user.id,
						data,
						_id : _this.info._id,
						create_time : new Date().getTime(),
						user,
						reply_username : _this.replyUsername,
					}
					uniCloud.callFunction({
						name : 'get-article',
						data : {
							action : 'addcomment',
							replyData,
							id : uni.getStorageSync('user').id
						},
						success(res) {
							if(res.result.updated === 1){
								if(!_this.replyId){
									replyData.children = [];
									_this.comment.push(replyData)
								}else{
									_this.getLev(_this.comment,_this.replyId,replyData)
								}
								_this.info.comment_count++;
								_this.updateHistoryId(_this.info._id,_this.info.comment_count)
								uni.$emit('updateData',_this.info)
								uni.$emit('updateInfo','comment')
							}
							_this.replyId = null
							uni.hideLoading()
						},
						fail() {
							uni.hideLoading()
							uni.showToast({
								title : '发送失败',
								icon : 'none'
							})
						}
					})
				})
				
			},
			// 回复评论
			replyComment(id,fid,replyUsername){
				if(fid === 0 && id){
					this.replyId = id;
					this.replyUsername = replyUsername;
				}
				else if(id && fid && replyUsername){
					this.replyId = fid;
					this.replyUsername = replyUsername;
				}

				this.focus = true
			},
			// 递归 找位置
			getLev(arr,id,data){
				for(let i=0;i<arr.length;i++){
					if(arr[i].id === id){
						if(arr[i].children){
							this.$set(arr[i].children,arr[i].children.length,data)
						}else{
							arr[i].children = [data]
						}
						break;
					}else if(arr[i].children && arr[i].children.length > 0){
						this.getLev(arr[i].children,id,data)
					}
				}
			},
			// 输入框失去焦点
			blur(){
				this.focus = false
			}
		}
	}
</script>

<style>

</style>
