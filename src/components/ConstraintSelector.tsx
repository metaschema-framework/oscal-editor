import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonToast
} from '@ionic/react';
import { add, close, checkmark, trash } from 'ionicons/icons';

// Default constraint files
const DEFAULT_CONSTRAINT_FILES = [
  {
    name: 'OSCAL External Constraints',
    url: 'https://raw.githubusercontent.com/GSA/fedramp-automation/refs/heads/develop/src/validations/constraints/oscal-external-constraints.xml',
    selected: true
  },
  {
    name: 'FedRAMP External Constraints',
    url: 'https://github.com/GSA/fedramp-automation/blob/develop/src/validations/constraints/fedramp-external-constraints.xml',
    selected: true
  },
  {
    name: 'FedRAMP External Allowed Values',
    url: 'https://github.com/GSA/fedramp-automation/raw/refs/heads/develop/src/validations/constraints/fedramp-external-allowed-values.xml',
    selected: true
  }
];

interface ConstraintFile {
  name: string;
  url: string;
  selected: boolean;
}

interface ConstraintSelectorProps {
  onConstraintsChange: (constraints: string[]) => void;
}

const ConstraintSelector: React.FC<ConstraintSelectorProps> = ({ onConstraintsChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [constraintFiles, setConstraintFiles] = useState<ConstraintFile[]>([...DEFAULT_CONSTRAINT_FILES]);
  const [newConstraintName, setNewConstraintName] = useState('');
  const [newConstraintUrl, setNewConstraintUrl] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Update parent component when selected constraints change
  useEffect(() => {
    const selectedConstraints = constraintFiles
      .filter(file => file.selected)
      .map(file => file.url);
    
    onConstraintsChange(selectedConstraints);
  }, [constraintFiles, onConstraintsChange]);

  const handleToggleConstraint = (index: number) => {
    const updatedFiles = [...constraintFiles];
    updatedFiles[index].selected = !updatedFiles[index].selected;
    setConstraintFiles(updatedFiles);
  };

  const handleAddConstraint = () => {
    if (!newConstraintName.trim() || !newConstraintUrl.trim()) {
      setToastMessage('Please provide both a name and URL for the constraint file');
      setShowToast(true);
      return;
    }

    // Check if URL is already in the list
    if (constraintFiles.some(file => file.url === newConstraintUrl.trim())) {
      setToastMessage('This constraint URL already exists in the list');
      setShowToast(true);
      return;
    }

    const newConstraint: ConstraintFile = {
      name: newConstraintName.trim(),
      url: newConstraintUrl.trim(),
      selected: true
    };

    setConstraintFiles([...constraintFiles, newConstraint]);
    setNewConstraintName('');
    setNewConstraintUrl('');
  };

  const handleRemoveConstraint = (index: number) => {
    // Don't allow removing default constraints
    if (index < DEFAULT_CONSTRAINT_FILES.length) {
      setToastMessage('Default constraint files cannot be removed');
      setShowToast(true);
      return;
    }

    const updatedFiles = [...constraintFiles];
    updatedFiles.splice(index, 1);
    setConstraintFiles(updatedFiles);
  };

  return (
    <>
      <IonButton onClick={() => setShowModal(true)}>
        <IonIcon slot="start" icon={checkmark} />
        Constraint Files ({constraintFiles.filter(file => file.selected).length})
      </IonButton>

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonToolbar>
          <IonTitle>Select Constraint Files</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowModal(false)}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        
        <IonContent>
          <IonList>
            {constraintFiles.map((file, index) => (
              <IonItem key={index}>
                <IonCheckbox 
                  checked={file.selected} 
                  onIonChange={() => handleToggleConstraint(index)}
                  slot="start"
                />
                <IonLabel>
                  <h2>{file.name}</h2>
                  <p style={{ wordBreak: 'break-all' }}>{file.url}</p>
                </IonLabel>
                <IonButton 
                  fill="clear" 
                  onClick={() => handleRemoveConstraint(index)}
                  disabled={index < DEFAULT_CONSTRAINT_FILES.length}
                >
                  <IonIcon icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Add Custom Constraint File</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput 
                  value={newConstraintName} 
                  onIonChange={e => setNewConstraintName(e.detail.value || '')}
                  placeholder="Enter constraint name"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">URL</IonLabel>
                <IonInput 
                  value={newConstraintUrl} 
                  onIonChange={e => setNewConstraintUrl(e.detail.value || '')}
                  placeholder="Enter constraint URL"
                />
              </IonItem>
              <IonButton 
                expand="block" 
                onClick={handleAddConstraint}
                disabled={!newConstraintName.trim() || !newConstraintUrl.trim()}
                style={{ marginTop: '16px' }}
              >
                <IonIcon slot="start" icon={add} />
                Add Constraint
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />
    </>
  );
};

export default ConstraintSelector;
