import './DataTable.css';

function DataTable({ columnas, filas }) {
  if (filas.length === 0) {
    return <p className="data-table-vacio">No hay datos para mostrar.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columnas.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.id}>
            {columnas.map((col) => (
              <td key={col.key} data-label={col.label}>
                {col.render ? col.render(fila) : fila[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;