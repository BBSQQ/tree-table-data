# tree-table-data

使用 react + antd 构建一个适用于多层级的树形表格解决方案

<img src="https://cdn.nlark.com/yuque/0/2019/gif/185307/1551004830688-970c5390-80ec-4447-ad4e-cc490b4df5cc.gif">

### input

实际业务中数据库存的数据是到最小细分的数据。<br />
首先需要明确的是三层关系，**typeClass - model - color**。<br />
某个 typeClass 下面会有几种 model； 某个 model 下面又会有几个 color。<br />
表中有所得数据均来自于一种typeClass，其下有 m1 m2 m3 三种model；而三个model 下又有 c1 - c10 不等的 color。就构成了如下的表格。<br />

|index|	model|	color|	E1|	E2|	E3|	N1|	N2|	N3|	S1|	S2|	W1|	W2|	C_SUM|
| ------ | ------ | ------ |-----| ------ | ------ | ------ |-----| ------ | ------ | ------ |------ | ------ | ------ |
|0|	m1|	c1|	144|	80|	87|	40|	80|	74|	87|	103|	96|	64|	855|
|1|	m1|	c2|	63|	33|	36|	16|	33|	29|	36|	43|	39|	26|	354|
|2|	m1|	c4|	44|	24|	26|	12|	24	|21	|26|	31|	28|	19|	255|
|...| ...| ...|...|...|...|...|...|...|...|...|...|...|...|
|9|	m1|	c8|	1|	0	|0	|0	|0	|0	|0|	0	|0	|0	|1|
|11	|m2	|c10|	138|	71|	78|	37|	71|	64|	78|	94|	86|	58|	775|
|...| ...| ...|...|...|...|...|...|...|...|...|...|...|...|
|21|	m2|	c5|	0|	1|	1|	0|	1|	0|	1|	1|	1|	0|	6|
|23|	m3|	c2|	107|	57|	62|	29|	57|	52|	62|	74|	67|	46|	613|
|...| ...| ...|...|...|...|...|...|...|...|...|...|...|...|
|35|	m3|	c4|	1|	0|	0|	0	|0	|0|	0|	0|	0|	0|	1|

### output

可是在页面上要求做一个有层级的汇总表。如下图所示
<img src="https://cdn.nlark.com/yuque/0/2019/png/185307/1551006582446-3308bcf3-c611-4c50-9a4e-fd71b78416c2.png">

---
### HOW??

**改变数据结构**
```
[
    { "index": "0", "model": "m1", "color": "c1", "E1": "144.0", ..., "W2": "64.0", "C_SUM": "855.0" },
    ...
]
```
=>
```
[
    {
      "rid": **, // 用于唯一标示row key
      "E1": **, // 各列汇总加和数据
      ...
      "key": "pbp" // 用于显示第一列各种不同分类
      "children":[
        { rid: **, key: "m1", "E1": **, ..., 
          children: [
            {rid: **, key: "c1", "E1": **, children: null },
            {rid: **, key: "c2", "E1": **, children: null },
            {rid: **, key: "c3", "E1": **, children: null },
          ] 
        },
        { rid: **, key: "m2", "E1": **, ..., children: [...] },
        { rid: **, key: "m3", "E1": **, ..., children: [...] }
      ]
    },
    ...
]
```
此时，antd Table 组件会自动识别 children 属性，如果有的话就认为是需要收缩的。完美～～
<img src="https://cdn.nlark.com/yuque/0/2019/png/185307/1551007703046-fc8fa301-1765-4328-b97e-2ecdb66bddf4.png" width="50" />
不过如果用的是 vue + element 就没有这么容易了。再加两个flag: open level 来标示是否点击展开。
我实际做项目的时候就是用的这种方法，由于想练习react，自己就做了react的demo。<br />
此项目主要想介绍我转换数据格式的方法，在此就不对 element-ui 做说明了。

* 先说使用：具体见 [App.js](https://github.com/BBSQQ/tree-table-data/blob/master/src/App.js)
```
// step 1: 声明对象
const sourceData = new TreeTable(data, hierarchy);
// step 2: 初始化对象
sourceData.init();
// step 3: 使用内部 get 获得对象属性
return sourceData.data;
 ```
之后就是把 sourceData.data 绑定到 Table 标签上了

* 再看原理：具体见 [tree-data/index.js](https://github.com/BBSQQ/tree-table-data/blob/master/src/tree-data/index.js)
```
/**
 * Creates an instance of TreeTable.
 * @param {Array} tableData detail 数据
 * @param {Array} hierarchy 层级结构对应表格字端
 * @class TreeTable
 *
 */
class TreeTable {
  constructor(tableData, hierarchy) {
    this.cache = _.cloneDeep(tableData);
    this.tableData = tableData;
    this.hierarchy = hierarchy;
  }
  columns() {
    return _.difference(_.keys(this.cache[0]), this.hierarchy);
  }
  graph() {
    const recursion = (group, index) => {
      _.forIn(group, (value, kay) => {
        group[kay] = _.groupBy(value, this.hierarchy[index]);
        if (index < this.hierarchy.length - 1) recursion(group[kay], index + 1);
      });
    };
    const group = _.groupBy(this.tableData, this.hierarchy[0]);
    recursion(group, 1);
    console.log("graph", group);
    this.tableData = group;
    return group;
  }
  obj2Arr() {
    let result = [];
    let level = 0;
    (function recursion(tableData, result, level) {
      _.forIn(tableData, (value, key) => {
        let row = { key, level, children: [], rid: _.uniqueId() };
        if (_.isArray(value)) row = { ...value[0], ...row, children: null };
        result.push(row);
        if (!_.isArray(value)) recursion(value, row.children, level + 1);
      });
    })(this.tableData, result, level);
    console.log("obj2Arr", result);
    this.tableData = result;
  }
  summarize() {
    const columns = this.columns();
    const isDepth = arr => _.every(arr, "children");
    (function recursion(tableData) {
      tableData.forEach(row => {
        if (isDepth(row.children)) recursion(row.children);
        columns.forEach(
          column =>
            (row[column] = _.sumBy(row.children, item => item[column] * 1))
        );
      });
    })(this.tableData);
  }
  init() {
    this.graph();
    this.obj2Arr();
    this.summarize();
  }
  get data() {
    return this.tableData;
  }
}
```
1. 实例化对象的时候，同时传入参数tableData 和 hierarchy。
* tableData 就是 input 中给出的数据库存的那种数据
* hierarchy 则是你想定义的层级关系。`['typeClass', 'model', 'color']` 三级两级甚至多级都可以，重点是要按顺序。

2. init的时候发生了两件事：
* 调用this.graph() 先把数据格式整理成类似图的层级数据格式
```
{
  pbp: {
    m1: { c1: {}, c2:{}, ... },
    m2: { c1: {}, c2:{}, ... },
    m3: { c1: {}, c2:{}, ... }
  }
}
```
* 调用 this.obj2Arr() 把之前的层级格式转化成数组的格式，把每个对象中的属性都放到 children 中。此时的结构就以及很接近最终的结构了。
* 调用 this.summarize() 从里至外，并汇总加和。

3. 最后定义一个对象的 get 方法，用于获取内部属性。
**大功告成！**
---
通过这次实践，为了实现对任意多层次结构的处理，对js的闭包有了更深的认识。代码中也用了下 react-hook 新特性。
平台是直接在[codesandbox](https://codesandbox.io/u/BBSQQ)上，感觉美美哒。
如有更优雅的解决方案，欢迎给我的 [github](https://github.com/BBSQQ/tree-table-data) 提出issue。😁
