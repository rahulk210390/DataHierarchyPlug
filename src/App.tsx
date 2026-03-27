import { DataHierarchyGrid } from './components/DataHierarchyGrid';
import { mockFinancialData } from './data/mockFinancialData';
import './styles/grid.css';

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">HierarchyFlex</h1>
        <p className="app__subtitle">
          Runtime drag-and-drop row hierarchy reorder · {mockFinancialData.length.toLocaleString()} rows · TanStack Table v8 + Virtual
        </p>
      </header>
      <DataHierarchyGrid data={mockFinancialData} />
    </div>
  );
}
