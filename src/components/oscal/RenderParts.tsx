import React from 'react';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { Part } from '../../types';
import { RenderProps } from './RenderProps';

interface RenderPartsProps {
  parts: Part[];
}

export const RenderParts: React.FC<RenderPartsProps> = ({ parts }) => {
  if (!parts?.length) return null;

  return (
    <IonList>
      {parts.map((part, index) => (
        <IonItem key={index}>
          <IonLabel>
            {part.title && <h3>{part.title}</h3>}
            {part.prose && <p>{part.prose}</p>}
            {part.props && <RenderProps props={part.props} />}
            {part.parts && part.parts.length > 0 && (
              <RenderParts parts={part.parts} />
            )}
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};
