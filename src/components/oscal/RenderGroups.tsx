import React from 'react';
import { IonAccordion, IonItem, IonLabel } from '@ionic/react';
import { ControlGroup } from '../../types';
import { RenderControls } from './RenderControls';
import { RenderProps } from './RenderProps';
import { RenderParts } from './RenderParts';
import { Virtuoso } from 'react-virtuoso';

interface RenderGroupsProps {
  groups: ControlGroup[];
}

export const RenderGroups: React.FC<RenderGroupsProps> = ({ groups }) => {
  if (!groups?.length) return null;

  // Flatten nested groups into a single array
  const flattenGroups = (groups: ControlGroup[]): ControlGroup[] => {
    return groups.reduce<ControlGroup[]>((acc, group) => {
      acc.push(group);
      if (group.groups?.length) {
        acc.push(...flattenGroups(group.groups));
      }
      return acc;
    }, []);
  };

  const flatGroups = flattenGroups(groups);

  return (
    <Virtuoso
      style={{ height: '100%', minHeight: '400px' }}
      totalCount={flatGroups.length}
      itemContent={index => {
        const group = flatGroups[index];
        return (
          <IonAccordion key={group.id || index} value={`group-${group.id || index}`}>
            <IonItem slot="header" color="light">
              <IonLabel>
                <h2>{group.title}</h2>
                <p>ID: {group.id}</p>
              </IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              {group.props && <RenderProps props={group.props} />}
              {group.parts && <RenderParts parts={group.parts} />}
              {'controls' in group && group.controls && group.controls.length > 0 && (
                <RenderControls controls={group.controls} />
              )}
            </div>
          </IonAccordion>
        );
      }}
    />
  );
};
