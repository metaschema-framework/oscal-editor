import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonChip, IonLabel } from '@ionic/react';
import { RenderProps } from './RenderProps';
import { ModifyParameterSetting } from '../../types';

interface ParameterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameter: ModifyParameterSetting;
}

export const ParameterDetailsModal: React.FC<ParameterDetailsModalProps> = ({
  isOpen,
  onClose,
  parameter
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Parameter: {parameter['param-id']}</IonTitle>
          <IonButton slot="end" onClick={onClose}>Close</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {parameter.label && (
          <div className="parameter-label">
            <h3>Label</h3>
            <p>{parameter.label}</p>
          </div>
        )}

        {parameter.values && parameter.values.length > 0 && (
          <div className="parameter-values">
            <h3>Values</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {parameter.values.map((value, idx) => (
                <IonChip key={idx} color="primary">
                  <IonLabel>{value}</IonLabel>
                </IonChip>
              ))}
            </div>
          </div>
        )}

        {parameter.constraints && parameter.constraints.length > 0 && (
          <div className="parameter-constraints">
            <h3>Constraints</h3>
            {parameter.constraints.map((constraint, idx) => (
              <div key={idx} className="constraint-item">
                {constraint.description && (
                  <p>{constraint.description}</p>
                )}
                {constraint.tests && constraint.tests.map((test, testIdx) => (
                  <IonChip key={testIdx} color="warning">
                    <IonLabel>{test.expression}</IonLabel>
                  </IonChip>
                ))}
              </div>
            ))}
          </div>
        )}

        {parameter.guidelines && parameter.guidelines.length > 0 && (
          <div className="parameter-guidelines">
            <h3>Guidelines</h3>
            {parameter.guidelines.map((guideline, idx) => (
              <p key={idx}>{guideline.prose}</p>
            ))}
          </div>
        )}

        {parameter.select && (
          <div className="parameter-select">
            <h3>Selection</h3>
            {parameter.select['how-many'] && (
              <p>Cardinality: {parameter.select['how-many']}</p>
            )}
            {parameter.select.choice && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {parameter.select.choice.map((choice, idx) => (
                  <IonChip key={idx} color="tertiary">
                    <IonLabel>{choice}</IonLabel>
                  </IonChip>
                ))}
              </div>
            )}
          </div>
        )}

        {parameter.usage && (
          <div className="parameter-usage">
            <h3>Usage</h3>
            <p>{parameter.usage}</p>
          </div>
        )}

        {parameter.props && (
          <div className="parameter-props">
            <h3>Properties</h3>
            <RenderProps props={parameter.props} />
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};
