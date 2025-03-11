import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonBadge,
  IonButtons,
  IonList,
} from '@ionic/react';
import { closeCircleOutline, linkOutline, alertCircleOutline, codeOutline } from 'ionicons/icons';
import { ParsedSarifResult } from '../services/sarifService';
import React from 'react';

interface ValidationResultsModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  results: ParsedSarifResult[];
  selectedResult?: ParsedSarifResult | null;
}

const ValidationResultsModal: React.FC<ValidationResultsModalProps> = ({
  isOpen,
  onDismiss,
  results,
  selectedResult
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar color="danger">
          <IonTitle>Validation Result Details</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={closeCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '20px' }}>
          {selectedResult ? (
            <div className="validation-details">
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <h2 style={{ margin: 0 }}>{selectedResult.ruleId}</h2>
                  {selectedResult.level && (
                    <IonBadge
                      color={
                        selectedResult.level === "error"
                          ? "danger"
                          : selectedResult.level === "warning"
                            ? "warning"
                            : "medium"
                      }
                    >
                      {selectedResult.level}
                    </IonBadge>
                  )}
                </div>
                <p style={{ fontSize: "1.1em", margin: "10px 0" }}>
                  {(selectedResult.message as any).text}
                </p>
              </div>

              {selectedResult.helpUri && (
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ display: "flex", alignItems: "center" }}>
                    <IonIcon icon={linkOutline} style={{ marginRight: "8px" }} />
                    Help Documentation
                  </h3>
                  <a
                    href={selectedResult.helpUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--ion-color-primary)",
                      wordBreak: "break-all",
                      display: "block",
                      padding: "12px",
                      backgroundColor: "var(--ion-color-light)",
                      borderRadius: "8px",
                      textDecoration: "none",
                      marginTop: "8px"
                    }}
                  >
                    {selectedResult.helpUri}
                  </a>
                </div>
              )}

              {selectedResult.ruleDescription && (
                <div style={{ marginBottom: "20px" }}>
                  <h3>Description</h3>
                  <div style={{
                    backgroundColor: "var(--ion-color-light)",
                    padding: "12px",
                    borderRadius: "8px",
                    marginTop: "8px"
                  }}>
                    {selectedResult.ruleDescription}
                  </div>
                </div>
              )}

              {selectedResult.location && (
                <div>
                  <h3>Location</h3>
                  {selectedResult.location.logicalPath && (
                    <div style={{ marginBottom: "15px" }}>
                      <strong>Path:</strong>
                      <div style={{
                        backgroundColor: "var(--ion-color-light)",
                        padding: "12px",
                        borderRadius: "8px",
                        fontFamily: "monospace",
                        overflowX: "auto",
                        marginTop: "8px"
                      }}>
                        {selectedResult.location.logicalPath}
                      </div>
                    </div>
                  )}

                  {selectedResult.location.uri && (
                    <div style={{ marginBottom: "15px" }}>
                      <strong>File:</strong>{" "}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <span style={{ fontFamily: "monospace" }}>
                          {selectedResult.location.uri}
                        </span>
                        {selectedResult.location.startLine && (
                          <IonButton
                            size="small"
                            fill="outline"
                            onClick={() => {
                              const filePath = `/Users/esper/Documents/oscal-editor-2/${selectedResult.location?.uri}`;
                              const line = selectedResult.location?.startLine;
                              window.open(`vscode://file${filePath}:${line}`);
                            }}
                          >
                            <IonIcon icon={codeOutline} slot="start" />
                            Open in VSCode
                          </IonButton>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "15px",
                    marginBottom: "20px"
                  }}>
                    {selectedResult.location.startLine && (
                      <div>
                        <strong>Line:</strong>{" "}
                        {selectedResult.location.startLine}
                        {selectedResult.location.endLine &&
                          selectedResult.location.endLine !== selectedResult.location.startLine
                          ? ` - ${selectedResult.location.endLine}`
                          : ""}
                      </div>
                    )}

                    {selectedResult.location.startColumn && (
                      <div>
                        <strong>Column:</strong>{" "}
                        {selectedResult.location.startColumn}
                        {selectedResult.location.endColumn &&
                          selectedResult.location.endColumn !== selectedResult.location.startColumn
                          ? ` - ${selectedResult.location.endColumn}`
                          : ""}
                      </div>
                    )}

                    {selectedResult.location.charOffset !== undefined && (
                      <div>
                        <strong>Offset:</strong> {selectedResult.location.charOffset}
                      </div>
                    )}

                    {selectedResult.location.charLength !== undefined && (
                      <div>
                        <strong>Length:</strong> {selectedResult.location.charLength}
                      </div>
                    )}
                  </div>

                  {selectedResult.location.snippet && (
                    <div>
                      <h3>Code Snippet</h3>
                      <pre style={{
                        backgroundColor: "var(--ion-color-light)",
                        padding: "12px",
                        borderRadius: "8px",
                        overflowX: "auto",
                        fontSize: "0.9em",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        marginTop: "8px"
                      }}>
                        {selectedResult.location.snippet}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {selectedResult.guid && (
                <div style={{
                  marginTop: "20px",
                  padding: "12px",
                  backgroundColor: "var(--ion-color-light)",
                  borderRadius: "8px",
                  fontSize: "0.9em"
                }}>
                  <strong>Result ID:</strong> {selectedResult.guid}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--ion-color-medium)'
            }}>
              <IonIcon
                icon={alertCircleOutline}
                style={{ fontSize: '48px', marginBottom: '16px' }}
              />
              <h3>No validation result selected</h3>
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ValidationResultsModal;
