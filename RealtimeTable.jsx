import React, { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function RealtimeTable() {
  const [ydoc] = useState(new Y.Doc());
  const [table, setTable] = useState([]);

  useEffect(() => {
    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      "realtime-table-demo",
      ydoc
    );

    const yarray = ydoc.getArray("table");

    // Initialize table as 5x5 if empty
    if (yarray.length === 0) {
      for (let i = 0; i < 5; i++) {
        yarray.push(["", "", "", "", ""]);
      }
    }

    // Observe changes from Yjs
    yarray.observeDeep(() => {
      setTable(yarray.toArray().map(row => [...row]));
    });

    return () => provider.destroy();
  }, []);

  const updateCell = (rowIdx, colIdx, value) => {
    const yarray = ydoc.getArray("table");
    const row = [...yarray.get(rowIdx)];
    row[colIdx] = value;
    yarray.delete(rowIdx, 1);
    yarray.insert(rowIdx, [row]);
  };

  // Add a new row at the end or at a specific index
const addRow = (index) => {
  const yarray = ydoc.getArray("table"); // main table Y.Array
  const cols = yarray.get(0)?.length || 5; // get number of columns
  const newRow = new Y.Array();
  
  // initialize cells in the row
  for (let i = 0; i < cols; i++) {
    newRow.push([""]); // each cell is a Y.Text/Y.Map if you need more complex data
  }

  ydoc.transact(() => {
    if (index !== undefined && index >= 0 && index < yarray.length) {
      yarray.insert(index, [newRow]);
    } else {
      yarray.push([newRow]);
    }
  });
};

// Delete a row at a given index
const deleteRow = (index) => {
  const yarray = ydoc.getArray("table");
  if (index < 0 || index >= yarray.length) return;

  ydoc.transact(() => {
    yarray.delete(index, 1);
  });
};

  const addColumn = () => {
    const yarray = ydoc.getArray("table");
    for (let i = 0; i < yarray.length; i++) {
      const row = [...yarray.get(i)];
      row.push("");
      yarray.delete(i, 1);
      yarray.insert(i, [row]);
    }
  };



  const deleteColumn = (colIdx) => {
    const yarray = ydoc.getArray("table");
    if (table[0].length <= 1) return;
    for (let i = 0; i < yarray.length; i++) {
      const row = [...yarray.get(i)];
      row.splice(colIdx, 1);
      yarray.delete(i, 1);
      yarray.insert(i, [row]);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Realtime Collaborative Table (Start 5x5)</h2>
      <table
        border="1"
        style={{ borderCollapse: "collapse", textAlign: "center", minWidth: 400 }}
      >
        <tbody>
          {table.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => (
                <td key={colIdx}>
                  <input
                    value={cell}
                    onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                    style={{ width: 80, textAlign: "center" }}
                  />
                </td>
              ))}
              <td>
                <button onClick={() => deleteRow(rowIdx)}>Delete Row</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={() => deleteColumn(table[0].length - 1)}>
          Delete Last Column
        </button>
      </div>
    </div>
  );
}

export default RealtimeTable;
