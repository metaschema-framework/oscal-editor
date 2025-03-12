import React, { useState } from 'react';
import { IonAccordion, IonItem, IonLabel, IonChip, IonIcon } from '@ionic/react';
import { Virtuoso } from 'react-virtuoso';
import { chevronForward } from 'ionicons/icons';
import { Component } from '../../types';
import { ComponentDetailsModal } from './ComponentDetailsModal';

interface RenderComponentsProps {
  components: Component[];
}

export const RenderComponents: React.FC<RenderComponentsProps> = ({ components }) => {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  if (!components?.length) return null;

  return (
    <IonAccordion value="components">
      <IonItem slot="header" color="light">
        <IonLabel>Components</IonLabel>
      </IonItem>
      <div className="ion-padding" slot="content" style={{ height: '60vh' }}>
        <Virtuoso
          data={components}
          itemContent={(index, component: Component) => (
            <IonItem button onClick={() => setSelectedComponent(component)}>
              <IonLabel>
                <h2>{component.title}</h2>
                <p>{component.description ? component.description.substring(0, 100) + (component.description.length > 100 ? '...' : '') : 'No description'}</p>
              </IonLabel>
              <IonChip color="medium" slot="end">
                <IonLabel>{component.type}</IonLabel>
              </IonChip>
              {component.status && (
                <IonChip color="warning" slot="end">
                  <IonLabel>{component.status.state}</IonLabel>
                </IonChip>
              )}
              <IonIcon icon={chevronForward} slot="end" />
            </IonItem>
          )}
          style={{ height: '100%' }}
        />
      </div>
      <ComponentDetailsModal
        isOpen={!!selectedComponent}
        onClose={() => setSelectedComponent(null)}
        component={selectedComponent || {} as Component}
      />
    </IonAccordion>
  );
};
