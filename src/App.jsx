
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Database,
  GitCompare,
  Search,
  ShieldCheck,
  AlertTriangle,
  X,
} from "lucide-react";

import taxData from "./data/okafor_lindqvist_2025_packet.json";
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
  // Load data from the original JSON file
  const documents = taxData.documents || [];
  const extractedValues = taxData.extracted_values || [];
  const returnVersions = taxData.return_versions || [];

  // Application state
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Filter documents based on the search text
  const filteredDocuments = documents.filter((doc) =>
    `${doc.title || ""} ${doc.id || ""} ${doc.document_type || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
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

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Tax return preparation and review workspace</p>
          </div>

          <div className="user-avatar">TF</div>
        </header>

        {/* DASHBOARD PAGE */}
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
                <h2>{documents.length}</h2>
                <span>Available source records</span>
              </div>

              <div className="stat-card">
                <Database size={24} />
                <p>Extracted Values</p>
                <h2>{extractedValues.length.toLocaleString()}</h2>
                <span>Extracted data fields</span>
              </div>

              <div className="stat-card">
                <GitCompare size={24} />
                <p>Return Versions</p>
                <h2>{returnVersions.length}</h2>
                <span>Available return versions</span>
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
                You have {documents.length} source documents
                and {extractedValues.length.toLocaleString()} extracted
                values available for review.
              </p>

              <p>
                Select Documents from the sidebar to search
                and inspect the original source records.
              </p>
            </section>
          </>
        ) : activePage === "Documents" ? (
          /* DOCUMENTS PAGE */
          <section className="content-panel">
            <div className="documents-header">
              <div>
                <h2>Source Documents</h2>
                <p>
                  {filteredDocuments.length} of {documents.length} documents
                </p>
              </div>

              <div className="document-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="document-list">
              {filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  className="document-row"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <FileText size={22} />

                  <div className="document-info">
                    <strong>{doc.title || doc.id}</strong>

                    <span>
                      {doc.id} · {doc.document_type || "Document"}
                    </span>
                  </div>

                  <span className="document-open">
                    View document →
                  </span>
                </button>
              ))}

              {filteredDocuments.length === 0 && (
                <p>No matching documents found.</p>
              )}
            </div>
          </section>
        ) : (
          /* OTHER PAGES - TO BE RESTORED */
          <section className="content-panel">
            <h2>{activePage}</h2>
            <p>
              This workspace will be restored in the next
              development steps.
            </p>
          </section>
        )}
      </main>

      {/* SOURCE DOCUMENT VIEWER */}
      {selectedDocument && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="document-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Source document"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {selectedDocument.title || selectedDocument.id}
                </h2>

                <p>
                  {selectedDocument.id} ·{" "}
                  {selectedDocument.document_type || "Document"}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedDocument(null)}
                aria-label="Close document"
              >
                <X size={22} />
              </button>
            </div>

            <div className="modal-content">
              {selectedDocument.pages?.length > 0 ? (
                selectedDocument.pages.map((page, index) => (
                  <div className="source-page" key={index}>
                    <h3>Page {page.page ?? index + 1}</h3>

                    <pre>
                      {page.printed_content ||
                        "No printed content available"}
                    </pre>
                  </div>
                ))
              ) : (
                <p>
                  No page content available for this document.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
