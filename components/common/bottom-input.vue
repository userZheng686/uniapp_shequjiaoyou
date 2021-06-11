<template>
	<view class="">
		<!--底部操作条-->
		<view class="fixed-bottom flex align-center border-top bg-white" style="height: 100rpx;">
			<input type="text" v-model="content" 
			class=" flex-1 rounded bg-light ml-2" 
			style="padding: 5rpx;"
			placeholder="文明发言" 
			:focus="focus"
			@blur="$emit('blur')"
			@confirm="submit"
			/>
			<view 
			class="iconfont icon-fabu flex align-center justify-center font-md animated"
			hover-class="jello text-main"
			@click="submit"
			 style="width: 100rpx;">
				
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		props : {
			focus : {
				type : Boolean,
				default : false
			}
		},
		data(){
			return {
				content : ""
			}
		},
		methods: {
			submit(){
				// 是否为空
				if(this.content === ''){
					return uni.showToast({
						title : '消息不能为空',
						icon : 'none'
					})
				}
				this.$emit('submit',this.content)
				this.content = ''
			}
		}
	}
</script>

<style>
</style>
