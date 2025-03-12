import React, { useState } from 'react';
import { IonAccordion, IonItem, IonLabel, IonChip, IonIcon } from '@ionic/react';
import { Virtuoso } from 'react-virtuoso';
import { chevronForward } from 'ionicons/icons';
import { SSPControlImplementation, ControlBasedRequirement } from '../../types';
import { RequirementDetailsModal } from './RequirementDetailsModal';

interface RenderImplementedRequirementsProps {
  implementation: SSPControlImplementation;
}

export const RenderImplementedRequirements: React.FC<RenderImplementedRequirementsProps> = ({ implementation }) => {
  const [selectedRequirement, setSelectedRequirement] = useState<ControlBasedRequirement | null>(null);
  
  return (
    <IonAccordion value="implemented-requirements">
      <IonItem slot="header" color="light">
        <IonLabel>Implemented Requirements</IonLabel>
      </IonItem>
      <div className="ion-padding" slot="content" style={{ height: '60vh' }}>
        <Virtuoso
          data={implementation['implemented-requirements']}
          itemContent={(index, req: ControlBasedRequirement) => (
            <IonItem button onClick={() => setSelectedRequirement(req)}>
              <IonLabel>

                <h2>Control: {req['control-id']}</h2>
                <p>
                  {req.statements && req.statements.length > 0
                    ? `${req.statements.length} statement${req.statements.length > 1 ? 's' : ''}`
                    : 'No statements'}
                </p>
              </IonLabel>
              {req.statements && req.statements.some(stmt => stmt['by-components'] && stmt['by-components'].length > 0) && (
                <IonChip color="success" slot="end">
                  <IonLabel>Has Components</IonLabel>
                </IonChip>
              )}
              <IonIcon icon={chevronForward} slot="end" />
            </IonItem>
          )}
          style={{ height: '100%' }}
        />
      </div>
      <RequirementDetailsModal
        isOpen={!!selectedRequirement}
        onClose={() => setSelectedRequirement(null)}
        requirement={selectedRequirement || {} as ControlBasedRequirement}
      />
    </IonAccordion>
  );
};
