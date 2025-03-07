import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonRouter,
  IonInput,
  IonBadge,
  IonFooter,
} from "@ionic/react";
import { Virtuoso } from "react-virtuoso";
import ConstraintSelector from "../components/ConstraintSelector";
import {
  checkmarkCircleOutline,
  documentOutline,
  codeOutline,
  closeCircleOutline,
  chevronForward,
  chevronBack,
  linkOutline,
  alertCircleOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import ImportOscal from "../components/ImportOscal";
import { RenderOscal } from "../components/oscal/RenderOscal";
import { useOscal } from "../context/OscalContext";
import { ApiService, ConversionService } from "../services/api";
import { OscalPackage } from "../types";
import { JSONTree } from "react-json-tree";
import { parseSarif, ParsedSarifResult } from "../services/sarifService";
import "./Documents.css";

interface DocumentEntry {
  id: string;
}

const Documents: React.FC = () => {
  const {
    packages,
    documents,
    setPackage,
    setDocumentId,
    documentId,
    packageId,
  } = useOscal();
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [footerHeight, setFooterHeight] = useState(300); // Default height in pixels
  const router = useIonRouter();
  const [documentList, setDocumentList] = useState<DocumentEntry[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Record<
    string,
    any
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastColor, setToastColor] = useState<string>("success");
  const [showToast, setShowToast] = useState(false);
  const [validationResults, setValidationResults] = useState<
    ParsedSarifResult[]
  >([]);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(
    new Set()
  );
  const [showMetapathResults, setShowMetapathResults] = useState(false);

  // Constraint files state
  const [constraintFiles, setConstraintFiles] = useState<string[]>([
    "https://raw.githubusercontent.com/GSA/fedramp-automation/refs/heads/develop/src/validations/constraints/oscal-external-constraints.xml",
    "https://github.com/GSA/fedramp-automation/blob/develop/src/validations/constraints/fedramp-external-constraints.xml",
    "https://github.com/GSA/fedramp-automation/raw/refs/heads/develop/src/validations/constraints/fedramp-external-allowed-values.xml",
  ]);

  // Metapath state
  const [metapathExpression, setMetapathExpression] = useState<string>("");
  const [metapathResults, setMetapathResults] = useState<string | null>(null);
  const [queryingMetapath, setQueryingMetapath] = useState(false);

  // Function to check if the current document is a profile
  const isProfile = (document: Record<string, any> | null): boolean => {
    if (!document) return false;

    // Check if this is an OSCAL profile document
    // Profiles in OSCAL typically have a 'profile' root element or property
    return (
      document.hasOwnProperty("profile") ||
      (document.hasOwnProperty("catalog") &&
        document.catalog?.hasOwnProperty("profile"))
    );
  };

  // Load document list when package changes
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const docs = await documents();
        const entries: DocumentEntry[] = docs.map((filename) => ({
          id: filename,
        }));
        setDocumentList(entries);
      } catch (error) {
        console.error("Failed to load documents:", error);
        setDocumentList([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [documents, packageId, documentId]);

  // Load selected document content when documentId changes
  useEffect(() => {
    const loadSelectedDocument = async () => {
      if (!documentId || !packageId) {
        setSelectedDocument(null);
        return;
      }

      try {
        let content = await ApiService.getPackageFile(packageId, documentId);
        if (!documentId.endsWith("json")) {
          const jsonContent = JSON.parse(
            await ConversionService.convertFile(
              new File([content], documentId),
              "json"
            )
          );
          setSelectedDocument(jsonContent);
        } else {
          setSelectedDocument(JSON.parse(content));
        }
      } catch (error) {
        console.error(`Failed to load document ${documentId}:`, error);
        setSelectedDocument(null);
      }
    };

    loadSelectedDocument();
  }, [documentId, packageId]);

  // Clear selected document when changing packages
  useEffect(() => {
    if (documentId && !documentList.find((entry) => entry.id === documentId)) {
      setDocumentId("");
      router.push("/documents");
    }
  }, [documentList, documentId, setDocumentId, router]);

  // Get document ID from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get("id");
    if (docId != null && docId !== documentId) {
      setDocumentId(docId);
    }
  }, [setDocumentId, documentId]);

  // Show validation footer when validation results are available
  useEffect(() => {
    if (validationResults.length > 0) {
      setFooterVisible(true);
    }
  }, [validationResults]);

  const handleValidate = async () => {
    if (!selectedDocument || !documentId) return;

    setValidating(true);
    try {
      const sarifData = await ApiService.validatePackageDocument(
        packageId,
        documentId,
        constraintFiles
      );
      const results = parseSarif(sarifData);
      setValidationResults(results);

      // Check if there are any validation failures
      const hasFailures = results.length > 0;

      if (hasFailures) {
        setToastColor("warning");
        setToastMessage(
          `Validation completed with ${results.length} issue${
            results.length !== 1 ? "s" : ""
          }`
        );
        setFooterVisible(true); // Show the validation footer
      } else {
        setToastColor("success");
        setToastMessage("Document validation successful - no issues found");
      }
      setShowToast(true);
    } catch (error) {
      setToastColor("danger");
      setToastMessage(
        `Validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setShowToast(true);
      setValidationResults([
        {
          ruleId: "error",
          message: "Validation service error occurred",
        },
      ]);
      setFooterVisible(true); // Show the validation footer
    } finally {
      setValidating(false);
    }
  };

  const handleConvert = async (targetFormat: string) => {
    if (!selectedDocument || !documentId) return;

    setConverting(true);
    try {
      const convertedDocument = await ConversionService.convertPackageDocument(
        packageId,
        documentId,
        targetFormat
      );
      const url = window.URL.createObjectURL(new Blob([convertedDocument]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentId.split(".")[0]}.${targetFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setToastMessage("Document converted successfully");
      setShowToast(true);
    } catch (error) {
      setToastMessage(
        `Conversion error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setShowToast(true);
    } finally {
      setConverting(false);
    }
  };

  const handleResolveProfile = async () => {
    if (!selectedDocument || !documentId || !packageId) return;

    setResolving(true);
    try {
      // Use the GET endpoint for more reliable profile resolution
      const resolved = await ApiService.resolvePackageProfile(
        packageId,
        documentId
      );

      // Create a download for the resolved profile
      const blob = new Blob([resolved], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Format the filename with -resolved suffix
      const filenameParts = documentId.split(".");
      const extension = filenameParts.pop() || "json";
      const baseName = filenameParts.join(".");
      a.download = `${baseName}-resolved.${extension}`;

      // Trigger the download
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToastColor("success");
      setToastMessage("Profile resolved successfully");
      setShowToast(true);
    } catch (error) {
      setToastColor("danger");
      setToastMessage(
        `Profile resolution error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setShowToast(true);
    } finally {
      setResolving(false);
    }
  };

  const handleMetapathQuery = async () => {
    if (!selectedDocument || !documentId || !metapathExpression) return;

    setQueryingMetapath(true);
    setShowMetapathResults(true);
    try {
      const results = await ApiService.queryPackageDocument(
        packageId,
        documentId,
        metapathExpression
      );
      setMetapathResults(results);
      setToastColor("success");
      setToastMessage("Metapath query executed successfully");
      setShowToast(true);
    } catch (error) {
      setMetapathResults(null);
      setToastColor("danger");
      setToastMessage(
        `Metapath query error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setShowToast(true);
    } finally {
      setQueryingMetapath(false);
    }
  };

  return (
    <div
      className="documents-container"
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Left Sidebar - Document Navigation */}
      <div
        className="left-sidebar"
        style={{
          width: leftSidebarVisible ? "300px" : "0",
          transition: "width 0.3s ease",
          overflow: "hidden",
          borderRight: "1px solid var(--ion-border-color)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          zIndex: 10,
        }}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Documents</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent
          style={{ paddingBottom: validationResults.length > 0 ? "50px" : "0" }}
        >
          <ImportOscal
            onImport={(documentId) => {
              router.push(`/documents?id=${documentId}`);
            }}
          />
          {loading ? (
            <IonItem>
              <IonLabel>
                <IonSpinner name="dots" /> Loading documents...
              </IonLabel>
            </IonItem>
          ) : (
            <IonList>
              {documentList.map(({ id }) => (
                <IonItem
                  key={id}
                  button
                  color={documentId === id ? "primary" : undefined}
                  onClick={() => {
                    setDocumentId(id);
                    router.push(`/documents?id=${id}`);
                  }}
                >
                  <IonIcon icon={documentOutline} slot="start" />
                  <IonLabel>{id}</IonLabel>
                </IonItem>
              ))}
              {documentList.length === 0 && (
                <IonItem>
                  <IonLabel color="medium">
                    No documents available in package '{packageId}'. Use the
                    import function above to add documents.
                  </IonLabel>
                </IonItem>
              )}
            </IonList>
          )}
        </IonContent>

        {/* Toggle button for left sidebar (visible when sidebar is collapsed) */}
        {!leftSidebarVisible && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "-40px",
              zIndex: 100,
              backgroundColor: "var(--ion-color-primary)",
              borderRadius: "0 4px 4px 0",
              padding: "10px",
              cursor: "pointer",
            }}
            onClick={() => setLeftSidebarVisible(true)}
          >
            <IonIcon
              icon={chevronForward}
              style={{ color: "white", fontSize: "20px" }}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <IonPage
        id="documents-main"
        style={{ width: "100%", position: "relative" }}
      >
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          color={toastColor}
          duration={3000}
          position="bottom"
        />
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
              >
                <IonIcon
                  icon={leftSidebarVisible ? chevronBack : chevronForward}
                />
              </IonButton>
            </IonButtons>
            <IonTitle>Documents</IonTitle>
            {selectedDocument && (
              <IonButtons slot="end">
                <ConstraintSelector onConstraintsChange={setConstraintFiles} />

                <IonButton onClick={handleValidate} disabled={validating}>
                  <IonIcon slot="start" icon={checkmarkCircleOutline} />
                  {validating ? "Validating..." : "Validate"}
                </IonButton>

                {isProfile(selectedDocument) && (
                  <IonButton
                    onClick={handleResolveProfile}
                    disabled={resolving}
                  >
                    <IonIcon slot="start" icon={documentOutline} />
                    {resolving ? "Resolving..." : "Resolve Profile"}
                  </IonButton>
                )}

                <IonSelect
                  value={""}
                  onIonChange={(e) => {
                    handleConvert(e.detail.value);
                  }}
                  interface="popover"
                >
                  <IonSelectOption disabled value="">
                    Convert
                  </IonSelectOption>
                  <IonSelectOption value="json">to JSON</IonSelectOption>
                  <IonSelectOption value="yaml">to YAML</IonSelectOption>
                  <IonSelectOption value="xml">to XML</IonSelectOption>
                </IonSelect>

                {validationResults.length > 0 && (
                  <IonButton onClick={() => setFooterVisible(!footerVisible)}>
                    <IonIcon icon={alertCircleOutline} />
                    <IonBadge color="danger" style={{ marginLeft: "5px" }}>
                      {validationResults.length}
                    </IonBadge>
                  </IonButton>
                )}
              </IonButtons>
            )}
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {selectedDocument && (
            <div
              className="metapath-bar"
              style={{
                borderBottom: "1px solid var(--ion-border-color)",
                marginBottom: "10px",
              }}
            >
              <IonToolbar>
                <IonInput
                  value={metapathExpression}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleMetapathQuery();
                    }
                  }}
                  onIonChange={(e) =>
                    setMetapathExpression(e.detail.value || "")
                  }
                  placeholder="Enter metapath expression (e.g., //control)"
                />
                <IonButtons slot="end">
                  <IonButton
                    onClick={handleMetapathQuery}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleMetapathQuery();
                      }
                    }}
                    disabled={queryingMetapath || !metapathExpression}
                  >
                    <IonIcon slot="start" icon={codeOutline} />
                    {queryingMetapath ? <IonSpinner name="dots" /> : "Execute"}
                  </IonButton>
                </IonButtons>
              </IonToolbar>

              {showMetapathResults && (
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>Metapath Results</span>
                      <IonButton
                        fill="clear"
                        onClick={() => setShowMetapathResults(false)}
                      >
                        <IonIcon icon={closeCircleOutline} />
                      </IonButton>
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {metapathResults !== null && (
                      <JSONTree hideRoot data={JSON.parse(metapathResults)} />
                    )}
                  </IonCardContent>
                </IonCard>
              )}
            </div>
          )}

          <IonGrid>
            <IonRow>
              <IonCol size="12">
                {documentId && selectedDocument ? (
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>
                        {packageId}-{documentId}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <div
                        style={{
                          padding: "1rem",
                          backgroundColor: "var(--ion-item-background)",
                          borderRadius: "4px",
                          margin: "0.5rem",
                          border: "1px solid var(--ion-border-color)",
                          boxShadow: "0 1px 2px var(--ion-color-step-100)",
                        }}
                      >
                        <RenderOscal
                          document={selectedDocument as OscalPackage}
                        />
                      </div>
                    </IonCardContent>
                  </IonCard>
                ) : (
                  <IonCard
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "calc(100% - 2rem)",
                      margin: "1rem",
                    }}
                  >
                    <IonCardContent style={{ textAlign: "center" }}>
                      <IonIcon
                        icon={documentOutline}
                        style={{
                          fontSize: "48px",
                          color: "var(--ion-color-step-500)",
                          marginBottom: "1rem",
                        }}
                      />
                      <p style={{ color: "var(--ion-color-step-500)" }}>
                        Select a document from the list to view its contents
                      </p>
                    </IonCardContent>
                  </IonCard>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
        <IonFooter>
          <div
            className="validation-footer"
            style={{
              right: 0,
              height: footerVisible ? `${footerHeight}px` : "40px",
              boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.2)",
              backgroundColor: "var(--ion-background-color)",
              borderTop: "2px solid var(--ion-color-danger)",
              transition: "height 0.3s ease",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Footer Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 10px",
                height: "40px",
                borderBottom: footerVisible
                  ? "1px solid var(--ion-border-color)"
                  : "none",
                backgroundColor: "var(--ion-color-danger)",
                cursor: "pointer",
              }}
              onClick={() => setFooterVisible(!footerVisible)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <IonIcon
                  icon={alertCircleOutline}
                  color={validationResults.length > 0 ? "light" : "danger"}
                  style={{ marginRight: "10px", fontSize: "20px" }}
                />
                <span style={{ fontWeight: "bold", color: "white" }}>
                  Validation Results
                  {validationResults.length > 0 && (
                    <IonBadge
                      color="warning"
                      style={{ marginLeft: "10px", fontWeight: "bold" }}
                    >
                      {validationResults.length}
                    </IonBadge>
                  )}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* Resize handle */}
                {footerVisible && (
                  <div
                    style={{
                      cursor: "ns-resize",
                      padding: "0 10px",
                      marginRight: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseDown={(e) => {
                      const startY = e.clientY;
                      const startHeight = footerHeight;

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const deltaY = startY - moveEvent.clientY;
                        const newHeight = Math.max(
                          100,
                          Math.min(600, startHeight + deltaY)
                        );
                        setFooterHeight(newHeight);
                      };

                      const onMouseUp = () => {
                        document.removeEventListener("mousemove", onMouseMove);
                        document.removeEventListener("mouseup", onMouseUp);
                      };

                      document.addEventListener("mousemove", onMouseMove);
                      document.addEventListener("mouseup", onMouseUp);
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "4px",
                        backgroundColor: "var(--ion-color-medium)",
                        borderRadius: "2px",
                      }}
                    ></div>
                  </div>
                )}

                <IonIcon
                  icon={
                    footerVisible
                      ? "chevron-down-outline"
                      : "chevron-up-outline"
                  }
                  style={{ fontSize: "20px", color: "white" }}
                />
              </div>
            </div>

            {/* Footer Content */}
            {footerVisible && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                {validationResults.length > 0 ? (
                  <Virtuoso
                    style={{ height: `${footerHeight - 40}px` }}
                    totalCount={validationResults.length}
                    itemContent={(index) => {
                      const result = validationResults[index];
                      const isExpanded = expandedResults.has(index);

                      return (
                        <React.Fragment>
                          <IonItem
                            button
                            onClick={() => {
                              setExpandedResults((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(index)) {
                                  newSet.delete(index);
                                } else {
                                  newSet.add(index);
                                }
                                return newSet;
                              });
                            }}
                            detail={true}
                            color="light"
                          >
                            <IonIcon
                              icon={closeCircleOutline}
                              color="danger"
                              slot="start"
                              style={{ marginRight: "10px" }}
                            />
                            <IonLabel
                              style={{
                                whiteSpace: "normal",
                                overflow: "visible",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <strong>{result.ruleId}</strong>
                                {result.level && (
                                  <IonBadge
                                    color={
                                      result.level === "error"
                                        ? "danger"
                                        : result.level === "warning"
                                        ? "warning"
                                        : "medium"
                                    }
                                    style={{
                                      marginLeft: "8px",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {result.level}
                                  </IonBadge>
                                )}
                              </div>
                              <div
                                style={{ fontSize: "0.9em", marginTop: "5px" }}
                              >
                                {(result.message as any).text}
                              </div>
                            </IonLabel>
                          </IonItem>

                          {isExpanded && (
                            <IonItem
                              lines="none"
                              className="validation-details"
                            >
                              <div
                                className="validation-accordion-content"
                                style={{
                                  padding: "10px 15px",
                                  backgroundColor:
                                    "var(--ion-color-light-shade)",
                                  width: "100%",
                                  borderRadius: "0 0 8px 8px",
                                }}
                              >
                                {result.helpUri && (
                                  <div
                                    className="help-uri"
                                    style={{ marginBottom: "15px" }}
                                  >
                                    <h4
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <IonIcon
                                        icon={linkOutline}
                                        style={{ marginRight: "5px" }}
                                      />
                                      Help Documentation
                                    </h4>
                                    <a
                                      href={result.helpUri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "var(--ion-color-primary)",
                                        wordBreak: "break-all",
                                        display: "block",
                                        padding: "8px",
                                        backgroundColor:
                                          "var(--ion-color-light)",
                                        borderRadius: "4px",
                                        textDecoration: "none",
                                      }}
                                    >
                                      {result.helpUri}
                                    </a>
                                  </div>
                                )}

                                {result.ruleDescription && (
                                  <div
                                    className="rule-description"
                                    style={{ marginBottom: "15px" }}
                                  >
                                    <h4>Description</h4>
                                    <p
                                      style={{
                                        backgroundColor:
                                          "var(--ion-color-light)",
                                        padding: "8px",
                                        borderRadius: "4px",
                                        fontSize: "0.9em",
                                      }}
                                    >
                                      {result.ruleDescription}
                                    </p>
                                  </div>
                                )}

                                {result.location && (
                                  <div className="location-info">
                                    <h4>Location</h4>

                                    {result.location.logicalPath && (
                                      <div style={{ marginBottom: "10px" }}>
                                        <strong>Path:</strong>
                                        <div
                                          style={{
                                            backgroundColor:
                                              "var(--ion-color-light)",
                                            padding: "8px",
                                            borderRadius: "4px",
                                            fontSize: "0.9em",
                                            fontFamily: "monospace",
                                            overflowX: "auto",
                                            marginTop: "5px",
                                          }}
                                        >
                                          {result.location.logicalPath}
                                        </div>
                                      </div>
                                    )}

                                    {result.location.uri && (
                                      <p>
                                        <strong>File:</strong>{" "}
                                        {result.location.uri}
                                      </p>
                                    )}

                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "10px",
                                        marginBottom: "10px",
                                      }}
                                    >
                                      {result.location.startLine && (
                                        <div>
                                          <strong>Line:</strong>{" "}
                                          {result.location.startLine}
                                          {result.location.endLine &&
                                          result.location.endLine !==
                                            result.location.startLine
                                            ? ` - ${result.location.endLine}`
                                            : ""}
                                        </div>
                                      )}

                                      {result.location.startColumn && (
                                        <div>
                                          <strong>Column:</strong>{" "}
                                          {result.location.startColumn}
                                          {result.location.endColumn &&
                                          result.location.endColumn !==
                                            result.location.startColumn
                                            ? ` - ${result.location.endColumn}`
                                            : ""}
                                        </div>
                                      )}

                                      {result.location.charOffset !==
                                        undefined && (
                                        <div>
                                          <strong>Offset:</strong>{" "}
                                          {result.location.charOffset}
                                        </div>
                                      )}

                                      {result.location.charLength !==
                                        undefined && (
                                        <div>
                                          <strong>Length:</strong>{" "}
                                          {result.location.charLength}
                                        </div>
                                      )}
                                    </div>

                                    {result.location.snippet && (
                                      <div>
                                        <h4>Code Snippet</h4>
                                        <pre
                                          style={{
                                            backgroundColor:
                                              "var(--ion-color-medium-tint)",
                                            padding: "10px",
                                            borderRadius: "4px",
                                            overflowX: "auto",
                                            fontSize: "0.9em",
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-all",
                                          }}
                                        >
                                          {result.location.snippet}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {result.guid && (
                                  <div
                                    style={{
                                      marginTop: "10px",
                                      fontSize: "0.8em",
                                      color: "var(--ion-color-medium)",
                                    }}
                                  >
                                    <strong>ID:</strong> {result.guid}
                                  </div>
                                )}
                              </div>
                            </IonItem>
                          )}
                        </React.Fragment>
                      );
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--ion-color-medium)",
                    }}
                  >
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      style={{
                        fontSize: "48px",
                        color: "var(--ion-color-success)",
                        marginBottom: "15px",
                      }}
                    />
                    <h4>No Validation Issues</h4>
                    <p>The document passed validation successfully.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </IonFooter>
      </IonPage>

      {/* Footer - Validation Results */}
    </div>
  );
};

export default Documents;
