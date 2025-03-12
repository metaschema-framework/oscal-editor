import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonChip, IonLabel, IonCardSubtitle, IonCard, IonCardHeader, IonItem, IonButtons } from '@ionic/react';
import { RenderProps } from './RenderProps';
import { ResponsibleRole, ControlBasedRequirement } from '../../types';

interface RequirementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: ControlBasedRequirement;
}

const renderResponsibleRoles = (roles: ResponsibleRole[]) => {
  if (!roles?.length) return null;

  return (
    <IonItem>
<IonButtons slot='start'>
Responsible Roles

</IonButtons>
      {roles.map((role, roleIndex) => (
        <IonChip key={roleIndex} color="medium">
          <IonLabel>{role["role-id"]}</IonLabel>
        </IonChip>
      ))}
</IonItem>
  );
};

export const RequirementDetailsModal: React.FC<RequirementDetailsModalProps> = ({
  isOpen,
  onClose,
  requirement
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Control: {requirement['control-id']}</IonTitle>
          <IonButton slot="end" onClick={onClose}>Close</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {requirement.remarks && <p>{requirement.remarks}</p>}
        {requirement.props && <RenderProps props={requirement.props} />}
        {requirement.statements?.map((statement, stmtIndex) => (
          <div key={stmtIndex} className="nested-content ion-padding">
            <h3 className="statement-id">{statement['statement-id']}</h3>
            {statement.remarks && <p>{statement.remarks}</p>}
            {statement.props && <RenderProps props={statement.props} />}
            {statement['by-components']?.map((byComp, compIndex) => (
              <div key={compIndex} className="by-component">
                <div className="by-component-header">
                  <IonChip color="success">
                    <IonLabel>Component: {byComp['component-uuid']}</IonLabel>
                  </IonChip>
                  {byComp['implementation-status'] && (
                    <IonChip color="warning">
                      <IonLabel>Status: {byComp['implementation-status'].state}</IonLabel>
                    </IonChip>
                  )}
                </div>
                {byComp.description && <p>{byComp.description}</p>}
                {byComp.props && <RenderProps props={byComp.props} />}
                {byComp['responsible-roles'] && renderResponsibleRoles(byComp['responsible-roles'])}
              </div>
            ))}
          </div>
        ))}
      </IonContent>
    </IonModal>
  );
};
