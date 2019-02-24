/**
 * @author Xi
 * */

import _ from "lodash";

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
  // attention!! index + 1
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
  // 加入 rid; key; children; level
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

export default TreeTable;
