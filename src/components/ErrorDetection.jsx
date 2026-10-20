
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  FileText,
} from "lucide-react";

function analyzeTaxData(taxData) {
  const documents = taxData.documents || [];
  const extractedValues = taxData.extracted_values || [];
  const versions = taxData.return_versions || [];
  const latestLines = versions.at(-1)?.lines || [];

  const issues = [];
  const documentMap = new Map();
  const extractionMap = new Map();
  const lineMap = new Map();

  function addIssue(type, title, description, reference) {
    issues.push({
      id: `issue-${issues.length + 1}`,
      type,
      title,
      description,
      reference: String(reference || "Unknown"),
    });
  }

  // Build document lookup
  for (const doc of documents) {
    if (documentMap.has(doc.id)) {
      addIssue(
        "error",
        "Duplicate document ID",
        `Multiple document records use ID ${doc.id}.`,
        doc.id
      );
    }

    documentMap.set(doc.id, doc);
  }

  // Check extraction records
  for (const extracted of extractedValues) {
    if (extractionMap.has(extracted.id)) {
      addIssue(
        "error",
        "Duplicate extraction ID",
        `Extraction ID ${extracted.id} appears more than once.`,
        extracted.id
      );
    }

    extractionMap.set(extracted.id, extracted);

    const doc = documentMap.get(extracted.document_id);

    if (!doc) {
      addIssue(
        "error",
        "Missing source document",
        `Extraction ${extracted.id} references document ${extracted.document_id}, which was not found.`,
        extracted.id
      );
      continue;
    }

    if (
      extracted.page !== null &&
      extracted.page !== undefined &&
      Array.isArray(doc.pages) &&
      !doc.pages.some(
        (page) => String(page.page) === String(extracted.page)
      )
    ) {
      addIssue(
        "error",
        "Invalid page reference",
        `Extraction ${extracted.id} references page ${extracted.page}, which was not found in document ${doc.id}.`,
        extracted.id
      );
    }
  }

  // Build latest return line lookup
  for (const line of latestLines) {
    if (lineMap.has(line.key)) {
      addIssue(
        "error",
        "Duplicate tax line key",
        `Tax line key ${line.key} appears more than once.`,
        line.key
      );
    }

    lineMap.set(line.key, line);
  }

  // Check tax line references
  for (const line of latestLines) {
    for (const sourceId of line.sources || []) {
      if (!extractionMap.has(sourceId)) {
        addIssue(
          "error",
          "Missing evidence reference",
          `Tax line ${line.key} references extraction ${sourceId}, which does not exist.`,
          line.key
        );
      }
    }

    for (const inputKey of line.inputs || []) {
      if (!lineMap.has(inputKey)) {
        addIssue(
          "error",
          "Missing calculation input",
          `Tax line ${line.key} references calculation input ${inputKey}, which does not exist.`,
          line.key
        );
      }
    }
  }

  // Identify possible duplicate documents.
  // This is only a review candidate, not a confirmed error.
  const documentGroups = new Map();

  for (const doc of documents) {
    const type = String(doc.document_type || "")
      .trim()
      .toLowerCase();
    const issuer = String(doc.issuer || "")
      .trim()
      .toLowerCase();
    const owner = String(doc.belongs_to || "")
      .trim()
      .toLowerCase();
    const year = String(doc.tax_year ?? "");

    if (!type || !issuer) continue;

    const groupKey = JSON.stringify([
      type,
      issuer,
      owner,
      year,
    ]);

    if (!documentGroups.has(groupKey)) {
      documentGroups.set(groupKey, []);
    }

    documentGroups.get(groupKey).push(doc);
  }

  for (const group of documentGroups.values()) {
    if (group.length < 2) continue;

    addIssue(
      "review",
      "Possible duplicate documents",
      `${group.map((doc) => doc.id).join(", ")} share the same document type, issuer, owner, and tax year. Verify whether they are separate records, replacements, or duplicate images.`,
      group.map((doc) => doc.id).join(", ")
    );
  }

  return issues;
}

function ErrorDetection({ taxData }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const issues = useMemo(
    () => analyzeTaxData(taxData),
    [taxData]
  );

  const errorCount = issues.filter(
    (issue) => issue.type === "error"
  ).length;

  const reviewCount = issues.filter(
    (issue) => issue.type === "review"
  ).length;

  const filteredIssues = issues.filter((issue) => {
    const matchesFilter =
      filter === "all" || issue.type === filter;

    const matchesSearch =
      `${issue.title} ${issue.description} ${issue.reference}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <section className="content-panel error-detection">
      <div className="error-page-header">
        <div>
          <h2>Error Detection Center</h2>
          <p>
            Review data integrity issues and possible duplicate
            documents.
          </p>
        </div>
      </div>

      <div className="error-stats">
        <div className="error-stat">
          <AlertCircle size={22} color="#dc2626" />
          <span>Structural Errors</span>
          <strong>{errorCount}</strong>
        </div>

        <div className="error-stat">
          <AlertTriangle size={22} color="#d97706" />
          <span>Needs Review</span>
          <strong>{reviewCount}</strong>
        </div>

        <div className="error-stat">
          <CheckCircle2 size={22} color="#16a34a" />
          <span>Total Findings</span>
          <strong>{issues.length}</strong>
        </div>
      </div>

      <div className="error-toolbar">
        <div className="error-search">
          <Search size={18} />
          <input
            placeholder="Search findings..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter findings"
        >
          <option value="all">All findings</option>
          <option value="error">Structural errors</option>
          <option value="review">Needs review</option>
        </select>
      </div>

      <div className="error-results">
        {filteredIssues.map((issue) => (
          <div className="error-item" key={issue.id}>
            <div className="error-item-icon">
              {issue.type === "error" ? (
                <AlertCircle color="#dc2626" size={21} />
              ) : (
                <AlertTriangle color="#d97706" size={21} />
              )}
            </div>

            <div className="error-item-content">
              <div className="error-item-title">
                <strong>{issue.title}</strong>
                <span
                  className={
                    issue.type === "error"
                      ? "error-tag"
                      : "review-tag"
                  }
                >
                  {issue.type === "error"
                    ? "Structural error"
                    : "Needs review"}
                </span>
              </div>

              <p>{issue.description}</p>

              <div className="error-reference">
                <FileText size={14} />
                {issue.reference}
              </div>
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="error-empty">
            <CheckCircle2 size={28} color="#16a34a" />
            <h3>No matching findings</h3>
            <p>
              No issues were found for this filter.
              This does not mean the tax return has been
              fully validated.
            </p>
          </div>
        )}
      </div>

      <p className="error-disclaimer">
        These checks cover reference integrity and possible
        document duplicates only. They do not verify tax
        calculations, printed amounts, or filing correctness.
      </p>
    </section>
  );
}

export default ErrorDetection;
