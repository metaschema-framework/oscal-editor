import React, { useState } from 'react';
import { IonAccordion, IonItem, IonLabel, IonChip, IonIcon } from '@ionic/react';
import { Virtuoso } from 'react-virtuoso';
import { chevronForward, documentOutline } from 'ionicons/icons';
import { BackMatter, Resource } from '../../types';
import { ResourceDetailsModal } from './ResourceDetailsModal';

interface RenderBackMatterProps {
  backMatter: BackMatter;
}

export const RenderBackMatter: React.FC<RenderBackMatterProps> = ({ backMatter }) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  if (!backMatter?.resources?.length) return null;

  return (
    <IonAccordion value="resources">
      <IonItem slot="header" color="light">
        <IonLabel>Resources</IonLabel>
      </IonItem>
      <div className="ion-padding" slot="content" style={{ height: '60vh' }}>
        <Virtuoso
          data={backMatter.resources}
          itemContent={(index, resource: Resource) => (
            <IonItem button onClick={() => setSelectedResource(resource)}>
              <IonIcon icon={documentOutline} slot="start" />
              <IonLabel>
                <h2>{resource.title}</h2>
                <p>{resource.description ? resource.description.substring(0, 100) + (resource.description.length > 100 ? '...' : '') : 'No description'}</p>
              </IonLabel>
              {resource.rlinks?.map((rlink, rlinkIndex) => (
                rlink['media-type'] && (
                  <IonChip key={rlinkIndex} color="tertiary" slot="end">
                    <IonLabel>{rlink['media-type'].split('/')[1] || rlink['media-type']}</IonLabel>
                  </IonChip>
                )
              ))}
              <IonIcon icon={chevronForward} slot="end" />
            </IonItem>
          )}
          style={{ height: '100%' }}
        />
      </div>
      <ResourceDetailsModal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource || {} as Resource}
      />
    </IonAccordion>
  );
};
