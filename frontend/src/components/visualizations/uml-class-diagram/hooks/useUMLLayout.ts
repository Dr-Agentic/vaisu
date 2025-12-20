import { useCallback } from 'react';
import type { ClassEntity, UMLRelationship } from '@shared/types';
import { useUMLDiagramStore } from '../stores/umlDiagramStore';
import { layoutEngine } from '../services/layoutEngine';

export function useUMLLayout() {
  const { setLayoutResult, setLayouting } = useUMLDiagramStore();

  const computeLayout = useCallback(async (
    classes: ClassEntity[],
    relationships: UMLRelationship[]
  ) => {
    if (classes.length === 0) return;

    setLayouting(true);

    const startTime = performance.now();

    const result = await layoutEngine.compute(classes, relationships, {
      algorithm: 'hierarchical',
      direction: 'TB',
      nodeSeparation: 80,
      rankSeparation: 120,
      edgeSeparation: 10
    });

    const endTime = performance.now();

    setLayoutResult({
      ...result,
      computationTime: endTime - startTime
    });

    console.log(`✅ Layout computed in ${Math.round(endTime - startTime)}ms for ${classes.length} classes`);

    setLayouting(false);
  }, [setLayoutResult, setLayouting]);

  return { computeLayout };
}