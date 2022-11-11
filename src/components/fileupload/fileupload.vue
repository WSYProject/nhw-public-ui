<template>
  <div>
    <div class="uploadWrapper">
      <Upload
        v-show="!isUploading"
        action="#"
        :limit="limit"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleChange"
        :accept="accept.map(item => (`.${item}`)).join(',')"
        :file-list="fileList"
        :on-exceed="handleExceed"
      >
        <!-- 上传按钮 -->
        <el-button size="mini" type="primary">选取文件</el-button>
      </Upload>
    </div>

    <!-- 进度显示 -->
    <div v-show="isUploading">
      <span>{{ percent.toFixed() }}%</span>
      <el-button v-if="!isSimple" style="margin-left: 10px" type="primary" size="small" @click="handleClickBtn">{{
        upload ? '暂停' : '继续'
      }}</el-button>
    </div>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'
import axios from 'axios'
import { Message, Upload } from 'element-ui'

export default {
  name: 'FileUpload',
  props: {
    // 预上传参数businessType
    businessType: {
      default: 'admin_daily_rpt_nhw_21',
      type: String
    },
    // 可接受的文件格式，[]为不限制
    accept: {
      default: () => ['doc', 'xls', 'ppt', 'txt', 'pdf'],
      type: Array
    },
    // 数量限制
    limit: {
      type: Number,
      default: 5
    },
    // 文件列表
    fileList: {
      type: Array,
      default: () => []
    },
    // 是否检测md5重复
    isCheckSameMd5: {
      default: false,
      type: Boolean
    },
    // 是否检测文件名重复
    isCheckSameName: {
      default: false,
      type: Boolean
    },
    // 业务是否有需要分段的可能性
    isNeedSegment: {
      default: false,
      type: Boolean
    },
    // 预上传require
    preUpload: {
      default: () => {},
      type: Function
    },
    // 华为切片上传
    segmentAccess: {
      default: () => {},
      type: Function
    },
    // 切片合并请求
    finishUpload: {
      default: () => {},
      type: Function
    }
  },
  components: {
    Upload
  },
  data () {
    return {
      isUploading: false,
      percent: 0,
      upload: true,
      percentCount: 0,
      uploadedFileInfo: null,
      videoUrl: '',
      md5Hex: '',
      segmentedFile: null,
      isSimple: true,
      chunkList: [],
      huaweiYunConfig: null
    }
  },
  methods: {
    async handleChange (file) {
      if (!file || file?.status !== 'ready') return
      const suffix = /\.([0-9A-z]+)$/.exec(file.raw.name)[1] // 文件后缀名
      // 有限制 && 当前文件类型不在accept中
      if (this.accept.length > 0 && !this.accept.includes(suffix)) {
        Message.error({ message: '请上传正确格式的文件' })
        return
      }
      this.isUploading = true
      this.percent = 1
      this.percentCount = 0
      this.videoUrl = ''
      // 获取文件并转成 ArrayBuffer 对象
      const fileObj = file.raw
      let buffer
      try {
        buffer = await this.fileToBuffer(fileObj)
      } catch (e) {
        console.log(e)
      }
      // 根据文件内容生成 hash 值
      const spark = new SparkMD5.ArrayBuffer()
      spark.append(buffer)
      const hash = spark.end()
      this.md5Hex = hash
      this.uploadedFileInfo = fileObj
      const params = {
        businessType: this.businessType,
        isCheckSameMd5: this.isCheckSameMd5,
        isCheckSameName: this.isCheckSameName,
        isNeedSegment: this.isNeedSegment,
        format: suffix,
        md5Hex: hash,
        name: fileObj.name,
        size: fileObj.size
      }
      // 预上传
      this.preUpload(params).then((res) => {
        const {
          contentType,
          isSameMd5,
          isSameName,
          isTaskComplete,
          partSize,
          signedUrl,
          uploadId,
          uploadMode,
          viewUrl
        } = res.data

        const option = {
          action: signedUrl,
          file: fileObj,
          headers: { 'Content-Type': contentType },
          name: fileObj.name,
          viewUrl,
          uploadId
        }
        this.huaweiYunConfig = option
        // 开启检测，并且 文件名 || 文件MD5 相同
        if (
          (this.isCheckSameMd5 && isSameName) ||
          (this.isCheckSameName && isSameMd5)
        ) {
          Message.error({ message: `${this.uploadedFileInfo.name} 文件名重名` })
          this.isUploading = false
          this.segmentedFile = null
          this.$emit('setFileList', this.segmentedFile)
          return
        }
        this.percent = 1
        // 同文件之前已经上传过 isTaskComplete,直接调用finish方法获取上传结果
        if (isTaskComplete) {
          this.obsFinished({
            uploadId,
            file: fileObj
          })
          return
        }
        if (uploadMode === 'simple') {
          this.obsUpload(option)
        } else if (uploadMode === 'multi_segment') {
          // 切片上传处理
          // 将文件按固定大小（6M）进行切片，注意此处同时声明了多个常量
          this.isSimple = false
          const chunkSize = partSize
          const chunkList = [] // 保存所有切片的数组
          const chunkListLength = Math.ceil(fileObj.size / chunkSize) // 计算总共多个切片

          // 生成切片，这里后端要求传递的参数为字节数据块（chunk）和每个数据块的文件名（fileName）
          let curChunk = 0 // 切片时的初始位置
          for (let i = 0; i < chunkListLength; i++) {
            const item = {
              chunk: fileObj.slice(curChunk, curChunk + chunkSize),
              fileName: `${hash}_${i}.${suffix}`, // 文件名规则按照 hash_1.jpg 命名
              uploadId: uploadId,
              partNumber: i + 1
            }
            curChunk += chunkSize
            chunkList.push(item)
          }
          this.chunkList = chunkList // sendRequest 要用到
          this.sendRequest({
            uploadId,
            file: fileObj
          })
        } else {
          // 上传过的文件 || 接口错误
          this.isUploading = false
          // toast('上传失败', 'error')
        }
      }).catch((msg) => {
        Message.error({ message: msg })
        this.resetSegmentedFile()
      })
    },

    // 发送请求
    sendRequest (values) {
      const requestList = [] // 请求集合
      const that = this
      this.chunkList.forEach((item, index) => {
        const fn = () => {
          const params = {
            partNumber: item.partNumber.toString(),
            uploadId: item.uploadId
          }
          return that.segmentAccess(params).then(async (res) => {
            if (res.code === 200) { // 成功
              if (that.percentCount === 0) { // 避免上传成功后会删除切片改变 chunkList 的长度影响到 percentCount 的值
                that.percentCount = 100 / that.chunkList.length
              }
              if (that.percent >= 90) {
                that.percent = 90
              } else {
                that.percent += that.percentCount // 改变进度
              }
              if (that.percent >= 90) {
                that.percent = 90
              }
              that.chunkList.splice(index, 1) // 一旦上传成功就删除这一个 chunk，方便断点续传
              const url = `${res?.data || ''}&partNumber=${params.partNumber}&uploadId=${params.uploadId}`
              await axios.request({
                method: 'put',
                url: url,
                data: item.chunk,
                headers: {
                  'Content-Type': that.huaweiYunConfig.headers?.['Content-Type']
                }
              })
            }
          })
        }
        requestList.push(fn)
      })

      let i = 0 // 记录发送的请求个数
      // 文件切片全部发送完毕后，需要请求 '/merge' 接口，把文件的 hash 传递给服务器
      const complete = (newValues) => {
        this.obsFinished({ uploadId: newValues.uploadId, file: newValues.file })
      }
      const send = async (newValues) => {
        if (!this.upload) return
        if (i >= requestList.length) {
          // 发送完毕
          complete(newValues)
          return
        }
        await requestList[i]()
        i++
        send(newValues)
      }
      send(values) // 发送请求
    },
    // finish接口
    obsFinished ({ uploadId, file }) {
      this.finishUpload({ uploadId })
        .then((res) => {
          const { id, viewUrl, path } = res.data
          this.segmentedFile = {
            name: file.name,
            fileName: file.name,
            filePath: path,
            url: viewUrl,
            resourceFileId: id
          }
          Message.success({ message: '已添加' })
          this.$emit('setFileList', this.segmentedFile)
        })
        .catch((msg) => {
          Message.error({ message: msg })
        })
        .finally(() => {
          this.percent = 100
          this.isUploading = false
        })
    },
    // simple上传接口
    obsUpload (option) {
      axios
        .request({
          method: 'put',
          url: option.action,
          data: option.file,
          headers: {
            'Content-Type': option.headers?.['Content-Type']
          }
        })
        .then(() => {
          this.percent = 50
          // 上传成功，调用上传完成接口
          this.obsFinished({
            file: option.file,
            uploadId: option.uploadId

          })
        })
    },
    // 按下暂停按钮
    handleClickBtn () {
      this.upload = !this.upload
      // 如果不暂停则继续上传
      if (this.upload) {
        this.sendRequest({
          uploadId: this.huaweiYunConfig.uploadId,
          file: this.huaweiYunConfig.file
        })
      }
    },

    // 将 File 对象转为 ArrayBuffer
    fileToBuffer (file) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = (e) => {
          resolve(e.target.result)
        }
        fr.readAsArrayBuffer(file)
        fr.onerror = () => {
          reject(new Error('转换文件格式发生错误'))
        }
      })
    },
    // 文件个数超出
    handleExceed () {
      Message.error({ message: `上传文件数量不能超过 ${this.limit} 个!` })
    },
    resetSegmentedFile () {
      this.isUploading = false
      this.percent = 1
      this.uploadedFileInfo = null
      this.isSimple = true
      this.md5Hex = ''
      this.segmentedFile = {}
      // NOTE 这里不处理简单上传的取消，因为简单上传太快了
      // 还需要取消worker中的上传任务
      // destroyWorker();
      this.$emit('setFileList', this.segmentedFile)
    }
  }
}
</script>
