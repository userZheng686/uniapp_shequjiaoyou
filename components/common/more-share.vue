<template>
	<view class="">
		<uniPopup ref="popup" type="bottom">
			<view class="w-100" style="background-color: white;">
				<view class="text-center py-2 font-md border-bottom border-light-secondary">
					分享到
				</view>
				<view class="flex align-center">
					<view class="flex-1 flex flex-column align-center justify-center py-2" 	
					hover-class="bg-light"
					@tap="share(item)"
					 v-for="(item,index) in providerList" :key="index">
						<view style="height: 100rpx;width: 100rpx;"
						:class="[item.icon,item.color]"
						class="iconfont text-white flex align-center justify-center font-lg rounded-circle"></view>
						<text class="font-sm mt-1 text-muted">{{item.name}}</text>
					</view>
				</view>
				<view class="text-center py-2 font-md border-top">
					取消
				</view>
			</view>
		</uniPopup>
	</view>
</template>

<script>
	import uniPopup from '../../components/uni-ui/uni-popup/uni-popup.vue';
	export default{
		props:{
			title : {
				type : String,
				default : ""
			},
			shareText : {
				type : String,
				default : ""
			},
			image : {
				type : String,
				default : []
			},
		},
		components:{
			uniPopup
		},
		onShareAppMessage() {
			return {
				title: this.title ? this.title : "欢迎体验uni-app",
				path: '/pages/tabBar/component/component',
				imageUrl:this.image ? this.image : 'https://img-cdn-qiniu.dcloud.net.cn/uniapp/app/share-logo@3.png'
			}
		},
		data(){
			return {
				shareType:0,
				providerList : [{
					icon : "icon-weixin",
					color : "bg-success",
					name : "微信好友",
					id: 'weixin',
					type : 0
				},{
					icon : "icon-huati",
					color : "bg-dark",
					name : "朋友圈",
					id: 'weixin',
					type:'WXSenceTimeline',
					sort:1
				},{
					icon : "icon-xinlangweibo",
					color : "bg-danger",
					name : "新浪微博",
					id: 'sinaweibo',
					sort:2
				},{
					icon : "icon-QQ",
					color : "bg-primary",
					name : "QQ好友",
					id: 'qq',
					sort : 3,
					type : 1
				}],
			}
		},
		methods:{
			open(){
				this.$refs.popup.open()
			},
			close(){
				this.$refs.popup.close()
			},
			async share(e) {
				this.shareType = 1;
				console.log(this.image)
				console.log('分享通道:'+ e.id +'； 分享类型:' + this.shareType);
				
				if(!this.shareText && (this.shareType === 1 || this.shareType === 0)){
					uni.showModal({
						content:'分享内容不能为空',
						showCancel:false
					})
					return;
				}
				
				if(!this.image && (this.shareType === 2 || this.shareType === 0)){
					uni.showModal({
						content:'分享图片不能为空',
						showCancel:false
					})
					return;
				}
				
				let shareOPtions = {
					provider: e.id,
					scene: e.type && e.type === 'WXSenceTimeline' ? 'WXSenceTimeline' : 'WXSceneSession', //WXSceneSession”分享到聊天界面，“WXSenceTimeline”分享到朋友圈，“WXSceneFavorite”分享到微信收藏     
					type: this.shareType,
					success: (e) => {
						console.log('success', e);
						uni.showModal({
							content: '已分享',
							showCancel:false
						})
					},
					fail: (e) => {
						console.log('fail', e)
						uni.showModal({
							content: e.errMsg,
							showCancel:false
						})
					},
					complete:function(){
						console.log('分享操作结束!')
					},
					summary : this.shareText,
					imageUrl : this.image,
					title : this.title,
					href : 'https://uniapp.dcloud.io'
				}
				
				
				if(shareOPtions.type === 0 && plus.os.name === 'iOS'){//如果是图文分享，且是ios平台，则压缩图片 
					shareOPtions.imageUrl = await this.compress();
				}
				uni.share(shareOPtions);
			},
			compress(){//压缩图片 图文分享要求分享图片大小不能超过20Kb
				console.log('开始压缩');
				let img = this.image;
				return new Promise((res) => {
					var localPath = plus.io.convertAbsoluteFileSystem(img.replace('file://', ''));
					console.log('after' + localPath);
					// 压缩size
					plus.io.resolveLocalFileSystemURL(localPath, (entry) => {
						entry.file((file) => {// 可通过entry对象操作图片 
							console.log('getFile:' + JSON.stringify(file));
							if(file.size > 20480) {// 压缩后size 大于20Kb
								plus.zip.compressImage({
									src: img,
									dst: img.replace('.jpg', '2222.jpg').replace('.JPG', '2222.JPG'),
									width: '10%',
									height: '10%',
									quality: 1,
									overwrite: true
								}, (event) => {
									console.log('success zip****' + event.size);
									let newImg = img.replace('.jpg', '2222.jpg').replace('.JPG', '2222.JPG');
									res(newImg);
								}, function(error) {
									uni.showModal({
										content:'分享图片太大,需要请重新选择图片!',
										showCancel:false
									})
								});
							}
						});
					}, (e) => {
						console.log('Resolve file URL failed: ' + e.message);
						uni.showModal({
							content:'分享图片太大,需要请重新选择图片!',
							showCancel:false
						})
					});
				})
			}
		}
	}
</script>

<style>
</style>
