<template>
  <div style="text-align: center">
    <div style="width: 500px; margin: 10px auto">
      <h5>分割面板</h5>
      <j-split v-model="value">
        <div slot="left">我是左边</div>
        <div slot="right">我是右边</div>
      </j-split>
    </div>
    <div style="width: 500px; margin: 10px auto">
      <h5>折叠面板</h5>
      <collapse v-model="collapseValue">
        <collapse-item name="1">
          史蒂夫·乔布斯
          <p slot="content">
            史蒂夫·乔布斯（Steve
            Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。
          </p>
        </collapse-item>
        <collapse-item name="2">
          史蒂夫·乔布斯
          <p slot="content">
            史蒂夫·乔布斯（Steve
            Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。
          </p>
        </collapse-item>
        <collapse-item name="3">
          史蒂夫·乔布斯
          <p slot="content">
            史蒂夫·乔布斯（Steve
            Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。史蒂夫·乔布斯（Steve
            Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。史蒂夫·乔布斯（Steve
            Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。史蒂夫·乔布斯（Steve
            Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。史蒂夫·乔布斯（Steve
            Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。史蒂夫·乔布斯（Steve
            Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。
          </p>
        </collapse-item>
      </collapse>
    </div>
  </div>
</template>

<script>
import JSplit from '@/components/split'
import Collapse from '@/components/collapse'
import CollapseItem from '@/components/collapseItem'
export default {
  data () {
    return {
      value: 0.5,
      collapseValue: '2',
      menuValue: '1',
      inputValue: 'test--test--test',
      maxValue: '111111111',
      search: ''
    }
  },
  components: {
    JSplit,
    Collapse,
    CollapseItem
  },
  methods: {
    onClick () {}
  }
}
</script>
