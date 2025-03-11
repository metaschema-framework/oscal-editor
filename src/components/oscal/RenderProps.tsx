import React from 'react';
import { IonChip, IonLabel, IonBadge } from '@ionic/react';
import { Property } from '../../types';

interface RenderPropsProps {
  props: Property[];
}

export const RenderProps: React.FC<RenderPropsProps> = ({ props }) => {
  if (!props?.length) return null;
  
  return (
    <div>
      {props.map((prop, index) => (
        <IonChip key={index} color="primary">
          <IonLabel>
            <strong>{prop.name}:</strong> {prop.value}
          </IonLabel>
          {prop.class && (
            <IonBadge color="light">
              {prop.class}
            </IonBadge>
          )}
        </IonChip>
      ))}
    </div>
  );
};
