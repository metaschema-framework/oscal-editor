import React, { useState } from 'react';
import { 
  IonItem, 
  IonLabel,
  IonCard,
  IonCardContent,
  IonBadge,
  IonIcon
} from '@ionic/react';
import { chevronForward, documentText, folderOpen } from 'ionicons/icons';
import { Control, ControlGroup } from '../../types';
import { SearchFilterControls, OscalItem } from './SearchFilterControls';

interface UnifiedSearchFilterProps {
  catalog: {
    controls?: Control[];
    groups?: ControlGroup[];
  };
}

const renderProps = (props: any[]) => (
  <div className="props-container">
    {props.map((prop, index) => (
      <IonBadge key={index} className="prop-chip">
        {prop.name}: {prop.value}
        {prop.class && <span className="prop-class">[{prop.class}]</span>}
      </IonBadge>
    ))}
  </div>
);

const renderParts = (parts: any[]) => (
  <div className="parts-container">
    {parts.map((part, index) => (
      <div key={index} className="part-item">
        <h4>{part.name}{part.title ? `: ${part.title}` : ''}</h4>
        {part.prose && <p>{part.prose}</p>}
      </div>
    ))}
  </div>
);

export const UnifiedSearchFilter: React.FC<UnifiedSearchFilterProps> = ({ catalog }) => {
  const [filteredItems, setFilteredItems] = useState<OscalItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemKey: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      prev.has(itemKey) ? newSet.delete(itemKey) : newSet.add(itemKey);
      return newSet;
    });
  };

  const renderItem = (item: OscalItem, index: number) => {
    const itemKey = `${item.type}-${item.id || ''}-${item.level}`;
    const isExpanded = expandedItems.has(itemKey);
    const isControl = item.type === 'control';
    const itemData = isControl ? item.originalControl : item.originalGroup;
    
    return (
      <IonCard key={`${itemKey}-${index}`} className={`item-card level-${item.level}`}>
        <IonItem 
          button 
          detail={false} 
          onClick={() => toggleExpand(itemKey)}
          className="item-header"
        >
          <IonIcon 
            icon={isControl ? documentText : folderOpen} 
            slot="start" 
            color={isControl ? 'primary' : 'tertiary'}
          />
          <IonLabel>
            <h2>{item.title}</h2>
            <p>{item.id}</p>
          </IonLabel>
          <IonBadge color={isControl ? 'primary' : 'tertiary'} slot="end">
            {item.type}
          </IonBadge>
          <IonIcon 
            icon={chevronForward} 
            slot="end" 
            className={isExpanded ? 'expanded-icon' : ''}
          />
        </IonItem>
        
        {isExpanded && itemData && (
          <IonCardContent>
            {itemData.props && renderProps(itemData.props)}
            {itemData.parts && renderParts(itemData.parts)}
          </IonCardContent>
        )}
      </IonCard>
    );
  };

  return (
    <div className="unified-search-filter">
      <SearchFilterControls 
        catalog={catalog}
        onFilteredItemsChange={setFilteredItems}
      />
      
      <div className="filtered-items-container">
        {filteredItems.length > 0 ? (
          <div className="results-list">
            {filteredItems.map((item, i) => renderItem(item, i))}
          </div>
        ) : (
          <div className="no-results">
            <p>No items match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedSearchFilter;
