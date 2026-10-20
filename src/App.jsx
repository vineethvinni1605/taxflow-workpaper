
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Database,
  GitCompare,
  Search,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import "./App.css";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Documents", icon: FileText },
  { name: "Tax Explorer", icon: Database },
  { name: "Compare Returns", icon: GitCompare },
  { name: "Search", icon: Search },
  { name: "QA Checks", icon: ShieldCheck },
  { name: "Error Detection", icon: AlertTriangle },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <div>
            <h2>TaxFlow</h2>
            <p>Tax Workpaper</p>
          </div>
        </div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={
                  activePage === item.name
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          TaxFlow Workpaper
          <span>Development Version</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Tax return preparation and review workspace</p>
          </div>

          <div className="user-avatar">TF</div>
        </header>

        {activePage === "Dashboard" ? (
          <>
            <div className="welcome-banner">
              <h2>Welcome to TaxFlow</h2>
              <p>
                Manage tax documents, review extracted values,
                trace calculations, and verify returns in one
                workspace.
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <FileText size={24} />
                <p>Source Documents</p>
                <h2>—</h2>
                <span>Awaiting data connection</span>
              </div>

              <div className="stat-card">
                <Database size={24} />
                <p>Extracted Values</p>
                <h2>—</h2>
                <span>Awaiting data connection</span>
              </div>

              <div className="stat-card">
                <GitCompare size={24} />
                <p>Return Versions</p>
                <h2>—</h2>
                <span>Awaiting data connection</span>
              </div>

              <div className="stat-card">
                <ShieldCheck size={24} />
                <p>Review Status</p>
                <h2>Pending</h2>
                <span>Checks not yet run</span>
              </div>
            </div>

            <section className="content-panel">
              <h2>Document Workspace</h2>
              <p>
                Your source documents will appear here after
                we connect the original JSON file.
              </p>
            </section>
          </>
        ) : (
          <section className="content-panel">
            <h2>{activePage}</h2>
            <p>
              This workspace will be restored in the next
              development steps.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
