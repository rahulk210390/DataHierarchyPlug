import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useHierarchyStore } from '../../store/hierarchyStore';
import type { DimensionDef } from '../../types';

interface SortableGroupItemProps {
  id: string;
  label: string;
  index: number;
  onRemove: (id: string) => void;
}

function SortableGroupItem({ id, label, index, onRemove }: SortableGroupItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group-by-panel__item${isDragging ? ' group-by-panel__item--dragging' : ''}`}
    >
      <span
        className="group-by-panel__drag-handle"
        {...attributes}
        {...listeners}
      >
        ⠿
      </span>
      <span className="group-by-panel__rank">{index + 1}</span>
      <span className="group-by-panel__label">{label}</span>
      <button
        className="group-by-panel__btn group-by-panel__btn--remove"
        onClick={() => onRemove(id)}
        title="Remove grouping"
      >
        ✕
      </button>
    </div>
  );
}

interface GroupByPanelProps {
  dimensions: DimensionDef[];
}

export function GroupByPanel({ dimensions }: GroupByPanelProps) {
  const { grouping, addGroup, removeGroup, setGrouping } = useHierarchyStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const available = dimensions.filter((d) => !grouping.includes(d.id));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: { active: { id: string | number } }) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = grouping.indexOf(String(active.id));
    const newIndex = grouping.indexOf(String(over.id));
    setGrouping(arrayMove(grouping, oldIndex, newIndex));
  }

  const activeLabel = activeId
    ? (dimensions.find((d) => d.id === activeId)?.label ?? activeId)
    : null;

  return (
    <div className="group-by-panel">
      <div className="group-by-panel__header">
        <span className="group-by-panel__title">Group By</span>
        <span className="group-by-panel__hint">
          {grouping.length === 0 ? 'No grouping active' : `${grouping.length} level${grouping.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Active grouping levels — drag-and-drop sortable */}
      <div className="group-by-panel__active">
        {grouping.length === 0 && (
          <div className="group-by-panel__empty">
            Click a dimension below to start grouping
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={grouping} strategy={verticalListSortingStrategy}>
            {grouping.map((id, index) => {
              const def = dimensions.find((d) => d.id === id);
              return (
                <SortableGroupItem
                  key={id}
                  id={id}
                  label={def?.label ?? id}
                  index={index}
                  onRemove={removeGroup}
                />
              );
            })}
          </SortableContext>

          <DragOverlay>
            {activeLabel ? (
              <div className="group-by-panel__item group-by-panel__overlay">
                <span className="group-by-panel__drag-handle">⠿</span>
                <span className="group-by-panel__label">{activeLabel}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Available dimensions */}
      {available.length > 0 && (
        <div className="group-by-panel__available">
          <span className="group-by-panel__available-label">Add dimension:</span>
          <div className="group-by-panel__chips">
            {available.map((dim) => (
              <button
                key={dim.id}
                className="group-by-panel__chip"
                onClick={() => addGroup(dim.id)}
              >
                + {dim.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
