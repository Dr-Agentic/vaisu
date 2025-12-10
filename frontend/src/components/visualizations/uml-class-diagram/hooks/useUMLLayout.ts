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
    
    try {
      const startTime = performance.now();
      
      const result = await layoutEngine.compute(classes, relationships, {
        algorithm: 'hierarchical',
        direction: 'top-to-bottom',
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
    } catch (error) {
      console.error('Layout computation failed:', error);
      
      // Fallback to simple grid layout
      const gridResult = layoutEngine.computeGridLayout(classes);
      setLayoutResult(gridResult);
    } finally {
      setLayouting(false);
    }
  }, [setLayoutResult, setLayouting]);

  return { computeLayout };
}