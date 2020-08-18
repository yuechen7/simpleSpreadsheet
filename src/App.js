import React from 'react';
import Papa from 'papaparse';
import ReactDOM from 'react-dom';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';

function onlyExactMatch(queryStr, value) {
  if (value != null) {
    return queryStr.toString() === value.toString();
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      csvfile: undefined,
      key: '',
      hotSettings: {
        data: Handsontable.helper.createSpreadsheetData(4, 4),
        colHeaders: true,
        rowHeaders: true,
        search: {
          queryMethod: onlyExactMatch
        },
        afterChange: function (change, source) {
          if (change != null) {
            var hot = this.hotTableComponent.current.hotInstance;
            var r = change[0][0];
            var c = parseInt(change[0][1], 10) - 1;
            var oldValue = change[0][2];
            var newValue = change[0][3];
            if (!(newValue in this.d)) {
              this.d[newValue] = new Set();
            }
            var row = hot.getRowHeader(r);
            var col = hot.getColHeader(c);
            this.d[newValue].add(col+row);
            this.d[oldValue].delete(col+row);
          }
        }.bind(this)
      },
      headers: []
    }
    this.updateData = this.updateData.bind(this);
    this.inputChangeHandler_search = this.inputChangeHandler_search.bind(this);
    this.inputChangeHandler_upload = this.inputChangeHandler_upload.bind(this);
    this.id = 'hot';
    this.hotTableComponent = React.createRef();
    
  }

  //handle upload csv file
  inputChangeHandler_upload(event) {
    this.setState({
      csvfile: event.target.files[0]
    });
  };

  importCSV = () => {
    const { csvfile } = this.state;
    Papa.parse(csvfile, {
      complete: this.updateData,
      header: true
    });
  };

  updateData(result) {
    this.setState({
      hotSettings: {
        data: result.data,
      }
    });
    this.indexing();
  }

  indexing = () => {
    this.d = {};
    var hot = this.hotTableComponent.current.hotInstance;
    const rowCount = hot.countRows();
    const colCount = hot.countCols();
    for (var r = 0; r < rowCount; r++) {
      for (var c = 0; c < colCount; c++) {
        var v = hot.getDataAtCell(r, c);
        if (v == null) continue;
        if (!(v in this.d)) {
          this.d[v] = new Set();
        }
        var row = hot.getRowHeader(r);
        var col = hot.getColHeader(c);
        this.d[v].add(col+row);
      }
    }
  }

  //handle search
  inputChangeHandler_search(event) {
    this.setState({
      key: event.target.value
    });
  };

  clickHandlerSearch = () => {
    var key = this.state.key;
    if (key in this.d) {
      let tmpArray = Array.from(this.d[key]);
      this.setState({
        headers: tmpArray
      })
    } else {
      this.setState({
        headers: []
      })
    }
  };


  render() {
    return (
      <div>
        <div>
          <HotTable root={this.id} ref={this.hotTableComponent} settings={this.state.hotSettings}/>
          <br/>
        </div>
        <div>
          <input
              className="csv-input"
              type="file"
              ref={input => {
                this.filesInput = input;
              }}
              name="file"
              placeholder={null}
              onChange={this.inputChangeHandler_upload}
            />
            <button onClick={this.importCSV.bind(this)}> Upload now!</button>
        </div>
        <br/>
        <div>
          <input
            value={this.state.key}
            onChange={this.inputChangeHandler_search}
            label='Search'
            placeholder='Search'
          />
          <input
            type="button"
            value="Search"
            onClick={this.clickHandlerSearch}
          />
        </div>
        <br/>
        <ul>
        Result:
        {this.state.headers.map(d => <li>{d}</li>)}
        </ul>
      </div>
    );
  }
}

export default App;
