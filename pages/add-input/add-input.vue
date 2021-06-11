<template>
	<view>
		<!--自定义导航-->
		<uniNavBar style="position: sticky;" left-icon="back"  statusBar :border="false" @clickLeft="goBack">
			<view class="flex align-center justify-center w-100">
				{{isopentext}}<text class="iconfont icon-shezhi" @click="changeIsOpen"></text>
			</view>
		</uniNavBar>
		
		<!--文本域-->
		<textarea v-model="title" value="" placeholder="标题" class="px-2 w-auto "style="height: 60rpx;" />
		<textarea v-model="content" value="" placeholder="说一句话吧~" class="px-2 w-auto " />
		
		<!--选中的分类-->
		<view class="font-md px-2 py-1 flex">
			<view class="border px-3 py main-color flex align-center justify-center" style="border-radius: 50rpx;">
				<text class="iconfont icon-huati mr-1"></text>
				{{post_class_name ? '所属分类:' + post_class_name : "请选择分类"}}
			</view>
		</view>
		
		<!--选中的话题-->
		<view class="font-md px-2 py-1 flex" >
			<view class="border px-3 py main-color flex align-center justify-center" style="border-radius: 50rpx;">
				<text class="iconfont icon-huati mr-1"></text>
				{{topic.title ? '所属话题:' + topic.title : "请选择话题"}}
			</view>
		</view>
		
		<!--多图上传-->
		<uploadImage style="padding-bottom: 100rpx;" :show="show" ref="uploadImage" :list="imageList" @change="changeImage"></uploadImage>
		<!--底部操作条-->
		<view class="fixed-bottom bg-white flex align-center" style=";height: 85rpx;">
			<picker mode="selector" :range="range" @change="choosePostClass">
				<view class="iconfont icon-caidan footer-btn animated" hover-class="jello">
					
				</view>
			</picker>
			<view class="iconfont icon-huati footer-btn animated" hover-class="jello"
			@click="chooseTopic"></view>
			<view class="iconfont icon-tupian footer-btn animated"
			 @click="iconClickEvent('uploadImage')"
			 hover-class="jello"></view>
			<view class="bg-main text-white ml-auto flex justify-center rounded mr-2 animated"
			 hover-class="jello"
			 @click="submit"
			 style="width: 140rpx;height: 60rpx;">
				发送
			</view>
		</view>
	</view>
</template>

<script>
	const isopenArray = ['所有人可见']
	import uniNavBar from '@/components/uni-ui/uni-nav-bar/uni-nav-bar.vue'
	import uploadImage from '@/components/common/upload-image.vue';
	export default {
		components:{
			uniNavBar,uploadImage
		},
		data() {
			return {
				title : '',
				content : "",
				imageList : [],
				imageListType : [],
				// 是否已经弹出提示框
				showBack : false,
				isopen : 0,
				topic : {
					id : 0,
					title : ''
				},
				post_class_id : 0,
				post_class_list : [],
				post_class_index : -1,
				errorImage : 0
			}
		},
		computed:{
			show(){
				return this.imageList.length > 0 
			},
			isopentext(){
				return isopenArray[this.isopen]
			},
			// 文章分类可选项
			range(){
				return this.post_class_list.map((item) => {
					return item.classname
				})
			},
			// 选中的分类
			post_class_name(){
				if(this.post_class_index !== -1){
					return this.post_class_list[this.post_class_index].classname
				}
			}
		},
		// 监听返回
		onBackPress() {
			if((this.content !== '' || this.imageList.length > 0) && !this.showBack
			){
				uni.showModal({
					content:'是否要保存为草稿',
					showCancel:true,
					cancelText:'不保存',
					confirmText:'保存',
					success : res => {
						if(res.confirm){
							this.store()
						}else{
							uni.removeStorage({
								key:'add-input',
								
							})
						}
						// 手动执行返回
						uni.navigateBack({
							delta:1
						})
					}
				})
				this.showBack = true
				return true
			}
		},
		// 页面加载时
		onLoad(){
			uni.getStorage({
				key : 'add-input',
				success: (res) => {
					if(res.data){
						
						let result = JSON.parse(res.data);
						this.post_class_id = result.post_class_id;
						this.post_class_list = result.postClassList;
						this.post_class_index = result.postClassIndex;
						this.topic.id = result.topicid;
						this.topic.title = result.topicTitle;
						this.title = result.title;
						this.content = result.content;
						this.imageList = result.imageList;
					}
				}
			})
			// 监听选择话题事件
			uni.$on('chooseTopic',(e)=>{
				this.topic.id = e.id;
				this.topic.title = e.title;
			})
			// 获取所有分类
			this.getPostClass()
		},
		beforeDestroy() {
			uni.$off('chooseTopic')
		},
		methods: {
			// 获取所有文章分类
			getPostClass(){
				let _this = this;
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						action : 'category'
					},
					success(res) {
						_this.post_class_list = res.result.data
					}
				})
			},
			// 发送
			submit(){
				if(this.title === '' || this.title === undefined){
					uni.showToast({
						title : '请输入标题',
						icon : 'none'
					})
					return;
				}
				if(this.content === '' || this.content === undefined){
					uni.showToast({
						title : '请输入内容',
						icon : 'none'
					})
					return;
				}
				if(this.post_class_id === 0){
					uni.showToast({
						title : '请选择分类',
						icon : 'none'
					})
					return;
				}
				if(this.topic.title === ''){
					uni.showToast({
						title : '请选择话题',
						icon : 'none'
					})
					return;
				}
				if(this.imageList.length === 0){
					uni.showToast({
						title : '请至少选择上传一个图片',
						icon : 'none'
					})
					return;
				}
				
				let obj = {
					"user_id": uni.getStorageSync('user').id,
					"title": this.title,
					"titlepic": this.imageList[0],
					"content": this.content,
					"sharenum": 0,
					"path": "",
					"type": 0,
					"create_time": new Date().getTime(),
					"post_class_id": this.post_class_id,
					"share_id": 0,
					"isopen": 1,
					"ding_count": 0,
					"cai_count": 0,
					"comment_count": 0,
					"images": this.imageList,
					"share": null,
					"support": [],
					"topic_class_id": this.topic.id
				};
				uniCloud.callFunction({
					name : 'get-article',
					data : {
						action : 'addArticle',
						obj : obj,
						id : JSON.parse(uni.getStorageSync('userinfo')).user_id
					},
					success(res) {
						if(res.result.id != ''){
							uni.showToast({
								title : '发送成功',
								icon : 'success'
							})
							obj._id = res.result.id
							obj.username = JSON.parse(uni.getStorageSync('userinfo')).username;
							obj.userpic = JSON.parse(uni.getStorageSync('userinfo')).userpic;
							obj.support = {
								support_count:0,
								type:"",
								unsupport_count:0
							}
							obj.isFollow = true
							uni.$emit('updateInfo','posting')
							uni.$emit('updatelist',obj)
							uni.navigateTo({
								url : "../index/index"
							})
						}else{
							uni.showToast({
								title : '发送失败',
								icon : 'nnone'
							})
						}
					},
					fail(res) {
						uni.showToast({
							title : '发送失败',
							icon : 'nnone'
						})
					}
				})
				
			},
			// 选择文章分类
			choosePostClass(e){
				this.post_class_id = this.post_class_list[e.detail.value]._id
				this.post_class_index = e.detail.value
			},
			// 选择话题
			chooseTopic(){
				uni.navigateTo({
					url : '../topic-nav/topic-nav?choose=true'
				})
			},
			// 底部图片点击事件
			iconClickEvent(e){
				switch(e){
					case 'uploadImage' : this.$refs.uploadImage.chooseImage();break;
				}
			},
			// 选中图片
			changeImage(e,eType){
				this.imageList = e;
				this.imageListType = eType
				let _this = this;
				console.log(_this.imageList)
				for(let i=0;i<_this.imageList.length;i++){
					if(_this.imageList[i].match('blob') || _this.imageList[i].match('file') || _this.imageList[i].match('_doc') !== null){
						uniCloud.uploadFile({
							filePath:_this.imageList[i],
							cloudPath: new Date().getTime() + '.' + _this.imageListType[i],
							success(res) {
								_this.imageList[i] = res.fileID
								console.log(res)
							},
							fail(res) {
								_this.errorImage++;
							}
						})
					}
				}
				if(_this.errorImage > 0){
					uni.showToast({
						title : '共有'+_this.errorImage + '上传失败，请重新上传',
						icon : 'none'
					})
				}
				
			},
			// 保存操作
			store(){
				let obj = {
					title : this.title,
					content : this.content,
					topicid : this.topic.id,
					topicTitle : this.topic.title,
					post_class_id : this.post_class_id,
					postClassList : this.post_class_list,
					postClassIndex : this.post_class_index,
					imageList : this.imageList
				}
				// 保存为本地存储
				uni.setStorage({
					key : 'add-input',
					data : JSON.stringify(obj)
				})
			},
			// 回退上一页
			goBack(){
				uni.navigateBack({
					delta:1
				})
			},
			// 更换是否可见选项
			changeIsOpen(){
				let _this = this;
				uni.showActionSheet({
					itemList:isopenArray,
					success(res) {
						_this.isopen = res.tapIndex
					}
				})
			}
		}
	}
</script>

<style>
.footer-btn{
	width: 65rpx;
	height: 65rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 50rpx;
}
</style>
