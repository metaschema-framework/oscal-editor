import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonChip, IonLabel, IonList, IonItem } from '@ionic/react';
import { RenderProps } from './RenderProps';
import { RenderParts } from './RenderParts';
import { Alteration } from '../../types';

interface AlterationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alteration: Alteration;
}

export const AlterationDetailsModal: React.FC<AlterationDetailsModalProps> = ({
  isOpen,
  onClose,
  alteration
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Control Alteration: {alteration['control-id']}</IonTitle>
          <IonButton slot="end" onClick={onClose}>Close</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {alteration.removes && alteration.removes.length > 0 && (
          <div className="removals-section">
            <h3>Removals</h3>
            <IonList>
              {alteration.removes.map((remove, idx) => (
                <IonItem key={idx}>
                  <IonLabel>
                    {remove['by-name'] && (
                      <div className="removal-item">
                        <IonChip color="danger">
                          <IonLabel>By Name</IonLabel>
                        </IonChip>
                        <p>{remove['by-name']}</p>
                      </div>
                    )}
                    {remove['by-class'] && (
                      <div className="removal-item">
                        <IonChip color="danger">
                          <IonLabel>By Class</IonLabel>
                        </IonChip>
                        <p>{remove['by-class']}</p>
                      </div>
                    )}
                    {remove['by-id'] && (
                      <div className="removal-item">
                        <IonChip color="danger">
                          <IonLabel>By ID</IonLabel>
                        </IonChip>
                        <p>{remove['by-id']}</p>
                      </div>
                    )}
                    {remove['by-item-name'] && (
                      <div className="removal-item">
                        <IonChip color="danger">
                          <IonLabel>By Item Name</IonLabel>
                        </IonChip>
                        <p>{remove['by-item-name']}</p>
                      </div>
                    )}
                    {remove['by-ns'] && (
                      <div className="removal-item">
                        <IonChip color="danger">
                          <IonLabel>By Namespace</IonLabel>
                        </IonChip>
                        <p>{remove['by-ns']}</p>
                      </div>
                    )}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}

        {alteration.adds && alteration.adds.length > 0 && (
          <div className="additions-section">
            <h3>Additions</h3>
            <IonList>
              {alteration.adds.map((add, idx) => (
                <IonItem key={idx}>
                  <IonLabel>
                    {add.position && (
                      <div className="addition-item">
                        <IonChip color="success">
                          <IonLabel>Position</IonLabel>
                        </IonChip>
                        <p>{add.position}</p>
                      </div>
                    )}
                    {add['by-id'] && (
                      <div className="addition-item">
                        <IonChip color="success">
                          <IonLabel>By ID</IonLabel>
                        </IonChip>
                        <p>{add['by-id']}</p>
                      </div>
                    )}
                    {add.title && (
                      <div className="addition-item">
                        <IonChip color="success">
                          <IonLabel>Title</IonLabel>
                        </IonChip>
                        <p>{add.title}</p>
                      </div>
                    )}
                    {add.props && (
                      <div className="addition-item">
                        <h4>Properties</h4>
                        <RenderProps props={add.props} />
                      </div>
                    )}
                    {add.parts && (
                      <div className="addition-item">
                        <h4>Parts</h4>
                        <RenderParts parts={add.parts} />
                      </div>
                    )}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};
