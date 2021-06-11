<template>
	<view>
		<uni-list-item title="头像"  showBadge @click="changeUserPic">
			<view class="flex align-center" slot="right" >
				<image :src="userpic ? userpic : '../../static/default.jpg'"
				 style="width: 120rpx;height: 120rpx;"
				 class="rounded-circle"
				 mode=""></image>
				<text class="iconfont icon-bianji1 ml-2"></text>
			</view>
			
		</uni-list-item>
		
		
		<uni-list-item title="昵称"  showBadge>
			<view class="flex align-center" slot="right" >
				<input style="padding: 9px;" class="uni-input text-right" type="text" v-model="username" />
				<text class="iconfont icon-bianji1"></text>
			</view>			
		</uni-list-item>
		
		<uni-list-item title="性别"  showBadge @click="changeSex">
			<view class="flex align-center" slot="right" >
				<text>{{sexText ? sexText : '未知'}}</text>
				<text class="iconfont icon-bianji1 ml-2"></text>
			</view>
			
		</uni-list-item>
		
		<uni-list-item title="生日"  showBadge>
			<picker mode="date" :value="birthday" @change="onDateChange" slot="right">
				<view class="flex align-center"  >
					<text>{{birthday ? birthday : '未知'}}</text>
					<text class="iconfont icon-bianji1 ml-2"></text>
				</view>
			</picker>
		</uni-list-item>
		
		
		<uni-list-item title="情感"  showBadge @click="changeEmotion">
			<view class="flex align-center" slot="right" >
				<text>{{sexEmotion ? sexEmotion : '未知'}}</text>
				<text class="iconfont icon-bianji1 ml-2"></text>
			</view>
		</uni-list-item>
		
		<uni-list-item title="职业"  showBadge @click="changeJob">
			<view class="flex align-center" slot="right" >
				<text>{{job ? job : '未知'}}</text>
				<text class="iconfont icon-bianji1 ml-2"></text>
			</view>
		</uni-list-item>
	
		<uni-list-item title="家乡"  showBadge @click="showCityPicker">
			<view class="flex align-center" slot="right" >
				<text>{{pickerText ? pickerText : '未知'}}</text>
				<text class="iconfont icon-bianji1 ml-2"></text>
			</view>
		</uni-list-item>
		
		<view class="py-2 px-3">
			<button class="bg-main text-white"
			 style="border-radius: 50rpx;border:0"
			 type="primary" @click="submit">完成</button>
		</view>
		
		<mpvue-city-picker :themeColor="themeColor"
		ref="mpvueCityPicker" :pickerValueDefault="pickerValueDefault"
		 @onConfirm="onConfirm"></mpvue-city-picker>
	</view>
</template>

<script>
	const sexArray = ['保密','男','女'];
	const emotionArray = ['保密','未婚','已婚'];
	import mpvueCityPicker from '../../components/uni-ui/mpvue-citypicker/mpvueCityPicker.vue'
	import uniListItem from '../../components/uni-ui/uni-list-item/uni-list-item.vue'
	export default {
		components:{
			uniListItem,
			mpvueCityPicker
		},
		data() {
			return {
				userpic : "",
				username : "",
				sex : "",
				emotion : 0,
				job : "",
				birthday : "",
				themeColor : "#007AFF",
				pickerText : '',
				pickerValueDefault : [0,0,1]
			}
		},
		computed:{
			sexText(){
				return sexArray[this.sex]
			},
			sexEmotion(){
				return emotionArray[this.emotion]
			}
		},
		onLoad() {
			this.getUserInfo()
		},
		methods: {
			getUserInfo(){
				let user = uni.getStorageSync('userinfo');
				user = JSON.parse(user);
				this.userpic = user.userpic;
				this.username = user.username;
				this.sex = user.sex;
				this.job = user.job;
				this.birthday = user.birthday;
				this.emotion = user.qg;
				this.pickerText = user.path
			},
			changeUserPic(){
				let _this = this;
				uni.chooseImage({
					count : 1,
					sizeType:["compressed"],
					sourceType:['album','camera'],
					success: (res) => {
						// #ifdef H5
						let type = res.tempFiles[0].type.split('/')[1]
						// #endif
						// #ifdef APP-PLUS
						let type = res.tempFiles[0].path.split('.')[1] + ''
						// #endif
						_this.userpic = res.tempFilePaths[0]
						uniCloud.uploadFile({
							filePath:res.tempFilePaths[0],
							cloudPath: new Date().getTime() + '.' + type,
							success(res) {
								_this.userpic = res.fileID
							},
							fail(res) {
								uni.showToast({
									title : '上传失败',
									icon : 'none'
								})
							}
						})
						console.log(res.tempFilePaths[0])
					}
				})
			},
			// 修改性别
			changeSex(){
				uni.showActionSheet({
					itemList:['保密','男','女'],
					success: (res) => {
						this.sex = res.tapIndex
					},
					fail: (res) => {
						
					}
				})
			},
			// 修改情感
			changeEmotion(){
				uni.showActionSheet({
					itemList:['保密','未婚','已婚'],
					success: (res) => {
						this.emotion = res.tapIndex
					},
					fail: (res) => {
						
					}
				})
			},
			// 修改职业
			changeJob(){
				let JobArray = ['it行业','教师','农民']
				uni.showActionSheet({
					itemList:JobArray,
					success: (res) => {
						this.job = JobArray[res.tapIndex]
					},
					fail: (res) => {
						
					}
				})
			},
			// 修改生日
			onDateChange(e){
				this.birthday = `${e.detail.value}`
			},
			// 修改城市确定
			onConfirm(e){
				this.pickerText = e.label
			},
			// 展示三级城市选择器
			showCityPicker(){
				this.$refs.mpvueCityPicker.show()
			},
			// 提交
			submit(){
				let _this = this;
				uniCloud.callFunction({
					name : 'user-do',
					data : {
						action : 'updateUserInfo',
						uid : JSON.parse(uni.getStorageSync('userinfo')).user_id,
						userpic : _this.userpic,
						username : _this.username,
						sex : _this.sex,
						qg : _this.emotion,
						job : _this.job,
						birthday : _this.birthday,
						path : _this.pickerText
					},
					success(res){
						if(res.result.updated === 1){
							uni.showToast({
								title : '修改成功',
								icon : 'success'
							})
							let user = uni.getStorageSync('userinfo');
							user = JSON.parse(user);
							user.userpic = _this.userpic;
							user.username = _this.username;
							user.sex = _this.sex;
							user.job = _this.job;
							user.birthday = _this.birthday;
							user.qg = _this.emotion;
							user.path = _this.pickerText
							uni.setStorageSync('userinfo',JSON.stringify(user))
							uni.$emit('updateInfo','user')
						}else{
							uni.showToast({
								title : '修改失败',
								icon : 'none'
							})
						}
					},
					fail(res) {
						uni.showToast({
							title : '修改失败',
							icon : 'none'
						})
					}
				})
			}
		},
		// 监听返回
		onBackPress() {
			if (this.$refs.mpvueCityPicker.showPicker) {
				this.$refs.mpvueCityPicker.pickerCancel();
				return true;
			}
		},
		// 监听卸载
		onUnload() {
			if (this.$refs.mpvueCityPicker.showPicker) {
				this.$refs.mpvueCityPicker.pickerCancel();
			}
		},
	}
</script>

<style>

</style>
