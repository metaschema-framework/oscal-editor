import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonChip, IonLabel } from '@ionic/react';
import { RenderProps } from './RenderProps';
import { Component, ResponsibleRole } from '../../types';

interface ComponentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: Component;
}

const renderParties = (partyUuids: string[]) => {
  return partyUuids.map(uuid => (
    <IonChip key={uuid} color="light">
      <IonLabel>{uuid}</IonLabel>
    </IonChip>
  ));
};

const renderResponsibleRoles = (roles: ResponsibleRole[]) => {
  if (!roles?.length) return null;

  return (
    <div className="roles-container">
      <h3 className="nested-header">Responsible Roles</h3>
      {roles.map((role, roleIndex) => (
        <div key={roleIndex}>
          <IonChip color="medium">
            <IonLabel>{role["role-id"]}</IonLabel>
          </IonChip>
          {role.props && <RenderProps props={role.props} />}
          {role["party-uuids"] && renderParties(role["party-uuids"])}
        </div>
      ))}
    </div>
  );
};

export const ComponentDetailsModal: React.FC<ComponentDetailsModalProps> = ({
  isOpen,
  onClose,
  component
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{component.title}</IonTitle>
          <IonButton slot="end" onClick={onClose}>Close</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="by-component-header">
          <IonChip color="medium">
            <IonLabel>{component.type}</IonLabel>
          </IonChip>
          {component.status && (
            <IonChip color="warning">
              <IonLabel>Status: {component.status.state}</IonLabel>
            </IonChip>
          )}
        </div>
        {component.description && <p>{component.description}</p>}
        {component.purpose && <p><strong>Purpose:</strong> {component.purpose}</p>}
        {component.props && <RenderProps props={component.props} />}
        {component["responsible-roles"] && renderResponsibleRoles(component["responsible-roles"])}
        {component.status?.remarks && (
          <p className="status-remarks">{component.status.remarks}</p>
        )}
      </IonContent>
    </IonModal>
  );
};
