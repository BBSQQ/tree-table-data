import React, { useState } from "react";
import { Table, Radio } from "antd";

import TreeTable from "./tree-data";
import tableData from "./mock/tableData.json";

const columns = [
  { title: "", dataIndex: "key", width: 150 },
  { title: "E1", dataIndex: "E1" },
  { title: "E2", dataIndex: "E2" },
  { title: "E3", dataIndex: "E3" },
  { title: "N1", dataIndex: "N1" },
  { title: "N2", dataIndex: "N2" },
  { title: "N3", dataIndex: "N3" },
  { title: "S1", dataIndex: "S1" },
  { title: "S2", dataIndex: "S2" },
  { title: "W1", dataIndex: "W1" },
  { title: "W2", dataIndex: "W2" },
  { title: "Total", dataIndex: "C_SUM" }
];

function getDataSource(level) {
  let hierarchy = ["model", "color"];
  let data = tableData.data;
  if (level === "3") {
    hierarchy = ["typeClass", "model", "color"];
    data = data.map(v => {
      v.typeClass = "p1";
      return v;
    });
  }
  // step 1: 声明对象
  const sourceData = new TreeTable(data, hierarchy);
  // step 2: 初始化对象
  sourceData.init();
  // step 3: 使用内部 get 获得对象属性
  return sourceData.data;
}

function App() {
  const initialLevel = "2";
  const [level, setLevel] = useState(initialLevel);
  const [dataSource, setDataSource] = useState(getDataSource(initialLevel));
  const handleChange = level => {
    setLevel(level);
    setDataSource(getDataSource(level));
  };
  return (
    <div className="App">
      <Radio.Group
        defaultValue={level}
        onChange={e => handleChange(e.target.value)}
      >
        <Radio.Button value="2">两级</Radio.Button>
        <Radio.Button value="3">三级</Radio.Button>
      </Radio.Group>
      <Table columns={columns} rowKey="rid" dataSource={dataSource} />
    </div>
  );
}

export default App;
