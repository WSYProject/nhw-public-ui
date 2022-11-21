# nhw-public-component-ui

vue2.x + webpack + element-ui

## First
```
npm install nhw-public-component-ui --save
```

## Second -  main.js 
```
import NhmUI from 'nhw-public-component-ui/dist/publicComponent'
import 'nhw-public-component-ui/dist/nhw-public-component-ui.css'
Vue.use(NhmUI)
```

## 组件使用，例如：
```
<template>
  <JSplit>
    <div slot="left">我是左边</div>
    <div slot="right">我是右边</div>
  </JSplit>
</template>
```

## FileUpload大文件组件参数

 |参数名      |说明      |参数类型       |默认值     |
 |:-:      |:-:      |:-:      |:-:              |
 |setFileList         |文件上传成功后接受数据的方法       |Function         |function(files) => {}     |
 |fileList            |已上传文件列表                   |Array            |[]    |
 |accept              |接受上传的文件格式                |Array[String]    |['doc', 'xls', 'ppt', 'txt', 'pdf']    |
 |limit               |限制上传文件个数                 |Number            |5     |
 |isCheckSameName     |是否检查文件名重名                |Boolean          |false    |
 |isCheckSameMd5      |是否检查文件名MD5重名             |Boolean          |false    |
 |isNeedSegment       |是否切片上传                     |Boolean          |false    |
 |businessType        |预上传businessType参数           |String           | 'admin_daily_rpt_nhw_21'  |
 |preUpload           |预上传接口请求                   |Function => Promise          |-    |
 |segmentAccess       |切片分片上传接口请求               |Function => Promise         |-    |
 |finishUpload        |切片整合接口                      |Function => Promise          |-    |
