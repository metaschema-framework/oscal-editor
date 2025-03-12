import React, { useState } from 'react';
import { IonAccordion, IonItem, IonLabel, IonChip, IonIcon } from '@ionic/react';
import { Virtuoso } from 'react-virtuoso';
import { chevronForward, settingsOutline, swapHorizontalOutline } from 'ionicons/icons';
import { ModifyControls, ModifyParameterSetting, Alteration } from '../../types';
import { ParameterDetailsModal } from './ParameterDetailsModal';
import { AlterationDetailsModal } from './AlterationDetailsModal';

interface RenderModifyProps {
  modify: ModifyControls;
}

export const RenderModify: React.FC<RenderModifyProps> = ({ modify }) => {
  const [selectedParameter, setSelectedParameter] = useState<ModifyParameterSetting | null>(null);
  const [selectedAlteration, setSelectedAlteration] = useState<Alteration | null>(null);

  return (
    <IonAccordion value="modify">
      <IonItem slot="header" color="light">
        <IonLabel>Modify Controls</IonLabel>
      </IonItem>
      <div className="ion-padding" slot="content">
        {modify['set-parameters'] && modify['set-parameters'].length > 0 && (
          <div>
            <h4>Parameter Settings</h4>
            <div style={{ height: '40vh' }}>
              <Virtuoso
                data={modify['set-parameters']}
                itemContent={(index, param: ModifyParameterSetting) => (
                  <IonItem button onClick={() => setSelectedParameter(param)}>
                    <IonIcon icon={settingsOutline} slot="start" />
                    <IonLabel>
                      <h2>{param['param-id']}</h2>
                      <p>{param.label || param.usage || 'No description'}</p>
                    </IonLabel>
                    {param.values && param.values.length > 0 && (
                      <IonChip color="primary" slot="end">
                        <IonLabel>{param.values.length} value{param.values.length !== 1 ? 's' : ''}</IonLabel>
                      </IonChip>
                    )}
                    {param.constraints && param.constraints.length > 0 && (
                      <IonChip color="warning" slot="end">
                        <IonLabel>{param.constraints.length} constraint{param.constraints.length !== 1 ? 's' : ''}</IonLabel>
                      </IonChip>
                    )}
                    <IonIcon icon={chevronForward} slot="end" />
                  </IonItem>
                )}
                style={{ height: '100%' }}
              />
            </div>
          </div>
        )}

        {modify.alters && modify.alters.length > 0 && (
          <div>
            <h4>Control Alterations</h4>
            <div style={{ height: '40vh' }}>
              <Virtuoso
                data={modify.alters}
                itemContent={(index, alter) => (
                  <IonItem button onClick={() => setSelectedAlteration(alter)}>
                    <IonIcon icon={swapHorizontalOutline} slot="start" />
                    <IonLabel>
                      <h2>Control: {alter['control-id']}</h2>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {alter.removes && (
                          <IonChip color="danger">
                            <IonLabel>{alter.removes.length} removal{alter.removes.length !== 1 ? 's' : ''}</IonLabel>
                          </IonChip>
                        )}
                        {alter.adds && (
                          <IonChip color="success">
                            <IonLabel>{alter.adds.length} addition{alter.adds.length !== 1 ? 's' : ''}</IonLabel>
                          </IonChip>
                        )}
                      </div>
                    </IonLabel>
                    <IonIcon icon={chevronForward} slot="end" />
                  </IonItem>
                )}
                style={{ height: '100%' }}
              />
            </div>
          </div>
        )}

        <ParameterDetailsModal
          isOpen={!!selectedParameter}
          onClose={() => setSelectedParameter(null)}
          parameter={selectedParameter || {} as ModifyParameterSetting}
        />
        
        <AlterationDetailsModal
          isOpen={!!selectedAlteration}
          onClose={() => setSelectedAlteration(null)}
          alteration={selectedAlteration || {} as Alteration}
        />
      </div>
    </IonAccordion>
  );
};
