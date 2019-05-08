const nodeExcel = require('excel-export');

module.exports = (_headers, rows) => {
  const conf = {};
  conf.name = 'sheet1';
  conf.cols = [];
  for (let i = 0; i < _headers.length; i++) {
    const col = {};
    col.caption = _headers[i].caption;
    col.type = _headers[i].type;
    conf.cols.push(col);
  }
  conf.rows = rows;
  const result = nodeExcel.execute(conf);
  return result;
};
