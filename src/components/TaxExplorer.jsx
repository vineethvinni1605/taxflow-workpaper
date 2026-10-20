
import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Database,
  GitBranch,
  ExternalLink,
  X,
} from "lucide-react";

function formatValue(value) {
  if (typeof value === "number") {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  }

  return value === null || value === undefined
    ? "—"
    : String(value);
}

function TaxExplorer({ taxData }) {
  const documents = taxData.documents || [];
  const extractedValues = taxData.extracted_values || [];
  const versions = taxData.return_versions || [];

  const latestVersion = versions[versions.length - 1];
  const lines = latestVersion?.lines || [];

  const [search, setSearch] = useState("");
  const [expandedLines, setExpandedLines] = useState({});
  const [sourcePreview, setSourcePreview] = useState(null);

  const lineMap = new Map(
    lines.map((line) => [line.key, line])
  );

  const valueMap = new Map(
    extractedValues.map((value) => [value.id, value])
  );

  const documentMap = new Map(
    documents.map((doc) => [doc.id, doc])
  );

  const filteredLines = lines.filter((line) =>
    `${line.key} ${line.label} ${line.form} ${line.line}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function toggleLine(key) {
    setExpandedLines((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  function renderCalculation(key, visited = new Set()) {
    const line = lineMap.get(key);

    if (!line) {
      return (
        <div className="trace-node">
          Referenced line not found: {key}
        </div>
      );
    }

    if (visited.has(key)) {
      return (
        <div className="trace-node">
          Circular reference detected: {key}
        </div>
      );
    }

    const nextVisited = new Set(visited);
    nextVisited.add(key);

    return (
      <div className="trace-node" key={key}>
        <div className="trace-node-header">
          <span>
            <strong>{line.key}</strong> — {line.label}
          </span>
          <strong>{formatValue(line.value)}</strong>
        </div>

        {line.inputs?.length > 0 && (
          <div className="trace-children">
            {line.inputs.map((inputKey, index) => (
              <div key={`${inputKey}-${index}`}>
                {renderCalculation(inputKey, nextVisited)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderSources(line) {
    if (!line.sources?.length) {
      return (
        <p className="explorer-muted">
          No direct source evidence is linked to this line.
        </p>
      );
    }

    return line.sources.map((sourceId, index) => {
      const extracted = valueMap.get(sourceId);

      if (!extracted) {
        return (
          <div className="evidence-card" key={`${sourceId}-${index}`}>
            <strong>{sourceId}</strong>
            <p>Referenced extraction record not found.</p>
          </div>
        );
      }

      const documentId =
        extracted.document_id ?? extracted.doc_id;

      const document = documentMap.get(documentId);

      const pageNumber =
        extracted.page ?? extracted.page_number;

      return (
        <div className="evidence-card" key={`${sourceId}-${index}`}>
          <div className="evidence-title">
            <FileText size={17} />
            <strong>
              {document?.title || documentId || sourceId}
            </strong>
          </div>

          <div className="evidence-details">
            <span>Evidence ID: {sourceId}</span>

            <span>
              Field: {extracted.field || "Not specified"}
            </span>

            <span>
              Page: {pageNumber ?? "Not specified"}
            </span>

            <span>
              Extracted value: {formatValue(extracted.value)}
            </span>

            <span>
              Confidence:{" "}
              {typeof extracted.confidence === "number"
                ? extracted.confidence <= 1
                  ? `${Math.round(extracted.confidence * 100)}%`
                  : `${extracted.confidence}%`
                : "Not specified"}
            </span>
          </div>

          {document && (
            <button
              className="source-view-button"
              onClick={() =>
                setSourcePreview({
                  document,
                  page: pageNumber,
                })
              }
            >
              <ExternalLink size={15} />
              View source document
            </button>
          )}
        </div>
      );
    });
  }

  return (
    <section className="content-panel tax-explorer">
      <div className="explorer-header">
        <div>
          <h2>Tax Explorer</h2>
          <p>
            Explore tax return calculations and supporting evidence.
          </p>
        </div>

        <div className="explorer-count">
          <Database size={17} />
          {filteredLines.length} of {lines.length} tax lines
        </div>
      </div>

      <div className="explorer-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search tax lines, forms, or labels..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="tax-line-list">
        {filteredLines.map((line) => {
          const isExpanded = !!expandedLines[line.key];

          return (
            <div className="tax-line-card" key={line.key}>
              <button
                className="tax-line-header"
                onClick={() => toggleLine(line.key)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}

                <div className="tax-line-info">
                  <strong>{line.label}</strong>

                  <span>
                    {line.key} · {line.form} ·{" "}
                    {line.jurisdiction}
                  </span>
                </div>

                <strong className="tax-line-value">
                  {formatValue(line.value)}
                </strong>
              </button>

              {isExpanded && (
                <div className="tax-line-expanded">
                  <div className="tax-line-metadata">
                    <p>
                      <strong>Form:</strong> {line.form}
                    </p>

                    <p>
                      <strong>Line:</strong> {line.line}
                    </p>

                    <p>
                      <strong>Rule:</strong>{" "}
                      {line.rule || "Not specified"}
                    </p>
                  </div>

                  {line.note && (
                    <div className="tax-line-note">
                      <strong>Calculation note</strong>
                      <p>{line.note}</p>
                    </div>
                  )}

                  <div className="explorer-section">
                    <h3>
                      <GitBranch size={18} />
                      Calculation Trace
                    </h3>

                    {line.inputs?.length > 0 ? (
                      <div className="trace-children">
                        {line.inputs.map((inputKey, index) => (
                          <div key={`${inputKey}-${index}`}>
                            {renderCalculation(
                              inputKey,
                              new Set([line.key])
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="explorer-muted">
                        No referenced calculation inputs.
                      </p>
                    )}
                  </div>

                  <div className="explorer-section">
                    <h3>
                      <FileText size={18} />
                      Source Evidence
                    </h3>

                    {renderSources(line)}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredLines.length === 0 && (
          <p className="explorer-muted">
            No matching tax lines found.
          </p>
        )}
      </div>

      {sourcePreview && (
        <div
          className="modal-overlay"
          onClick={() => setSourcePreview(null)}
        >
          <div
            className="document-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Source evidence document"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{sourcePreview.document.title}</h2>
                <p>{sourcePreview.document.id}</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSourcePreview(null)}
                aria-label="Close source document"
              >
                <X size={22} />
              </button>
            </div>

            <div className="modal-content">
              {sourcePreview.document.pages?.length ? (
                sourcePreview.document.pages.map((page, index) => (
                  <div className="source-page" key={index}>
                    <h3>
                      Page {page.page ?? index + 1}
                      {String(page.page) ===
                        String(sourcePreview.page) && (
                        <span className="page-reference">
                          {" "}· Referenced page
                        </span>
                      )}
                    </h3>

                    <pre>
                      {page.printed_content ||
                        "No printed content available"}
                    </pre>
                  </div>
                ))
              ) : (
                <p>No document pages available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TaxExplorer;
