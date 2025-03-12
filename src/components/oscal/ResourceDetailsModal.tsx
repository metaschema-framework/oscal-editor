import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonChip, IonLabel, IonNote } from '@ionic/react';
import { RenderProps } from './RenderProps';
import { Resource } from '../../types';

interface ResourceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
}

const openResource = (href: string, mediaType?: string) => {
  window.open(href, '_blank');
};

export const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({
  isOpen,
  onClose,
  resource
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{resource.title}</IonTitle>
          <IonButton slot="end" onClick={onClose}>Close</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {resource.description && <p>{resource.description}</p>}
        {resource.props && <RenderProps props={resource.props} />}
        
        {resource.rlinks && resource.rlinks.length > 0 && (
          <div>
            <h3>Resource Links</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {resource.rlinks.map((rlink, rlinkIndex) => (
                <div key={rlinkIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonChip 
                    color="tertiary" 
                    onClick={() => openResource(rlink.href, rlink['media-type'])}
                  >
                    <IonLabel>
                      {rlink['media-type'] 
                        ? rlink['media-type'].split('/')[1] || rlink['media-type']
                        : 'Open Link'}
                    </IonLabel>
                  </IonChip>
                  {rlink.hashes?.map((hash, hashIndex) => (
                    <IonChip key={hashIndex} color="light">
                      <IonLabel>{hash.algorithm}: {hash.value}</IonLabel>
                    </IonChip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {resource.citation && (
          <div className="ion-margin-top">
            <h3>Citation</h3>
            <p>{resource.citation.text}</p>
            {resource.citation.props && <RenderProps props={resource.citation.props} />}
          </div>
        )}

        {resource.base64 && (
          <div className="ion-margin-top">
            <h3>Base64 Content</h3>
            <IonChip color="primary">
              <IonLabel>
                {resource.base64.filename || resource.base64['media-type'] || 'Download Content'}
              </IonLabel>
            </IonChip>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};
