import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { Control } from '../../types';
import { RenderProps } from './RenderProps';
import { RenderParts } from './RenderParts';
import { Virtuoso } from 'react-virtuoso';

interface RenderControlsProps {
  controls: Control[];
}

export const RenderControls: React.FC<RenderControlsProps> = ({ controls }) => {
  if (!controls?.length) return null;
  
  return (
    <Virtuoso
      style={{ height: '100%', minHeight: '400px' }}
      totalCount={controls.length}
      itemContent={index => {
        const control = controls[index];
        return (
          <IonItem key={control.id || index}>
            <IonLabel>
              <h2>{control.title}</h2>
              <p>ID: {control.id}</p>
              {control.props && <RenderProps props={control.props} />}
              {control.parts && <RenderParts parts={control.parts} />}
            </IonLabel>
          </IonItem>
        );
      }}
    />
  );
};
