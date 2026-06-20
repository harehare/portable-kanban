import * as React from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

type Axis = 'vertical' | 'horizontal';

const allowedEdges: Record<Axis, Edge[]> = {
  vertical: ['top', 'bottom'],
  horizontal: ['left', 'right'],
};

type UseSortableItemOptions<T extends Record<string, unknown>> = {
  id: string;
  data: T;
  axis?: Axis;
  dragHandleRef?: React.RefObject<HTMLElement | null>;
};

type UseSortableItemResult = {
  ref: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  closestEdge: Edge | null;
};

export const useSortableItem = <T extends Record<string, unknown>>({
  id,
  data,
  axis = 'vertical',
  dragHandleRef,
}: UseSortableItemOptions<T>): UseSortableItemResult => {
  const ref = React.useRef<HTMLDivElement>(null);
  const dataRef = React.useRef(data);
  dataRef.current = data;

  const [isDragging, setIsDragging] = React.useState(false);
  const [closestEdge, setClosestEdge] = React.useState<Edge | null>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        dragHandle: dragHandleRef?.current ?? undefined,
        getInitialData: () => ({ id, ...dataRef.current }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        getData: ({ input }) =>
          attachClosestEdge({ id, ...dataRef.current }, { element, input, allowedEdges: allowedEdges[axis] }),
        onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      }),
    );
  }, [id, axis, dragHandleRef]);

  return { ref, isDragging, closestEdge };
};
