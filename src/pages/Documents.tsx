import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonProgressBar,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  chevronBack,
  chevronForward,
  closeCircleOutline,
  codeOutline,
  documentOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { JSONTree } from "react-json-tree";
import { Virtuoso } from "react-virtuoso";
import ConstraintSelector from "../components/ConstraintSelector";
import ImportOscal from "../components/ImportOscal";
import { RenderOscal } from "../components/oscal/RenderOscal";
import ValidationResultsModal from "../components/ValidationResultsModal";
import { useOscal } from "../context/OscalContext";
import { ApiService, ConversionService } from "../services/api";
import { ParsedSarifResult, parseSarif } from "../services/sarifService";
import { OscalPackage } from "../types";
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
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedValidationResult, setSelectedValidationResult] =
    useState<ParsedSarifResult | null>(null);
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

  // Show validation footer when validation results are available
  useEffect(() => {
    if (validationResults.length > 0) {
      setFooterVisible(true);
    }
  }, [validationResults]);

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

  // Get document ID from URL on initial load and handle sidebar visibility
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get("id");
    if (docId != null && docId !== documentId) {
      setDocumentId(docId);
      setLeftSidebarVisible(false); // Hide sidebar when document is selected
    }
  }, [setDocumentId, documentId]);

  // Show sidebar when no document is selected
  useEffect(() => {
    if (!documentId) {
      setLeftSidebarVisible(true);
    }
  }, [documentId]);

  const handleValidate = async () => {
    if (!selectedDocument || !documentId) return;

    setValidating(true);
    try {
      const sarifData = await ApiService.validatePackageDocument(
        packageId,
        documentId,
        constraintFiles
      );
      const results = parseSarif(sarifData).filter((x) => x.kind === "fail");
      setValidationResults(results);

      if (results.length > 0) {
        setToastColor("warning");
        setToastMessage(
          `Validation completed with ${results.length} issue${
            results.length !== 1 ? "s" : ""
          }`
        );
        setFooterVisible(true);
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
      const errorResult = {
        ruleId: "error",
        message: "Validation service error occurred",
      };
      setValidationResults([errorResult]);
      setFooterVisible(true);
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

  const handleResolveProfile = async (targetFormat: string) => {
    if (!selectedDocument || !documentId || !packageId) return;

    setResolving(true);
    try {
      const resolved = await ApiService.resolvePackageProfile(
        packageId,
        documentId
      );

      // Convert the resolved profile to the target format if it's not JSON
      const finalContent =
        targetFormat === "json"
          ? resolved
          : await ConversionService.convertFile(
              new File([resolved], documentId),
              targetFormat
            );

      const blob = new Blob([finalContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const filenameParts = documentId.split(".");
      filenameParts.pop(); // Remove old extension
      const baseName = filenameParts.join(".");
      a.download = `${baseName}-resolved.${targetFormat}`;

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
          {loading && <IonProgressBar type="indeterminate" />}
        </IonHeader>
        <IonContent
          style={{ paddingBottom: validationResults.length > 0 ? "50px" : "0" }}
        >
          <ImportOscal
            onImport={(documentId) => {
              setLeftSidebarVisible(false);
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
                    setLeftSidebarVisible(false);
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
            {loading && <IonProgressBar type="indeterminate" />}
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
                  <IonSelect
                    value={""}
                    onIonChange={(e) => {
                      if (e.detail.value) {
                        handleResolveProfile(e.detail.value);
                      }
                    }}
                    interface="popover"
                    disabled={resolving}
                  >
                    <IonSelectOption disabled value="">
                      <IonChip>
                        {resolving ? "RESOLVING..." : "RESOLVE"}
                      </IonChip>
                    </IonSelectOption>
                    <IonSelectOption value="json">to JSON</IonSelectOption>
                    <IonSelectOption value="yaml">to YAML</IonSelectOption>
                    <IonSelectOption value="xml">to XML</IonSelectOption>
                  </IonSelect>
                )}

                <IonSelect
                  value={""}
                  onIonChange={(e) => {
                    handleConvert(e.detail.value);
                  }}
                  interface="popover"
                >
                  <IonSelectOption disabled value="">
                    <IonChip>CONVERT</IonChip>
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
                <IonButtons slot="start">
                  <IonIcon />
                </IonButtons>
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

        {/* Validation Results Modal */}
        <ValidationResultsModal
          isOpen={showValidationModal}
          onDismiss={() => {
            setShowValidationModal(false);
            setSelectedValidationResult(null);
          }}
          results={validationResults}
          selectedResult={selectedValidationResult}
        />

        {/* Footer - Validation Results */}
        {validationResults.length > 0 && (
          <IonFooter>
            <div
              style={{
                height: footerVisible ? `${footerHeight}px` : "40px",
                backgroundColor: "var(--ion-background-color)",
                borderTop: "2px solid var(--ion-color-danger)",
                transition: "height 0.3s ease",
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
                  backgroundColor: "var(--ion-color-danger)",
                  cursor: "pointer",
                }}
                onClick={() => setFooterVisible(!footerVisible)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IonIcon
                    icon={alertCircleOutline}
                    color="light"
                    style={{ marginRight: "10px", fontSize: "20px" }}
                  />
                  <span style={{ fontWeight: "bold", color: "white" }}>
                    Validation Results
                    <IonBadge
                      color="warning"
                      style={{ marginLeft: "10px", fontWeight: "bold" }}
                    >
                      {validationResults.length}
                    </IonBadge>
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
                          document.removeEventListener(
                            "mousemove",
                            onMouseMove
                          );
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
                          backgroundColor: "white",
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
                <div
                  style={{ height: `${footerHeight - 40}px`, overflow: "auto" }}
                >
                  <Virtuoso
                    style={{ height: "100%" }}
                    totalCount={validationResults.length}
                    itemContent={(index) => {
                      const result = validationResults[index];
                      return (
                        <IonItem
                          button
                          onClick={() => {
                            setSelectedValidationResult(result);
                            setShowValidationModal(true);
                          }}
                          detail={true}
                          color="light"
                        >
                          <IonIcon
                            icon={alertCircleOutline}
                            color="danger"
                            slot="start"
                            style={{ marginRight: "10px" }}
                          />
                          <IonLabel>
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
                                  style={{ marginLeft: "8px" }}
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
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </IonFooter>
        )}
      </IonPage>
    </div>
  );
};

export default Documents;
