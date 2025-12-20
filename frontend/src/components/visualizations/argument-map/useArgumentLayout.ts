import { useMemo } from 'react';
import type { ArgumentMapData, ArgumentNode, ArgumentEdge } from '../../../../../shared/src/types';

interface Position {
    x: number;
    y: number;
}

interface LayoutResult {
    nodes: (ArgumentNode & Position)[];
    edges: ArgumentEdge[];
    width: number;
    height: number;
}

const LAYER_HEIGHT = 150;
const NODE_WIDTH = 250;
const NODE_SPACING = 50;

export function useArgumentLayout(data: ArgumentMapData | null, width: number, height: number): LayoutResult {
    return useMemo(() => {
        if (!data) return { nodes: [], edges: [], width: 0, height: 0 };

        // const nodesWithPos: (ArgumentNode & Position)[] = []; // Unused variable removed
        const positions = new Map<string, Position>();

        // 1. Identify Root (Main Claim)
        // If not explicitly set in metadata, find the first claim or node with no incoming supporting/attacking edges
        let mainClaimId = data.metadata?.mainClaimId;
        if (!mainClaimId) {
            const targetIds = new Set(data.edges.map(e => e.target));
            const potentialRoots = data.nodes.filter(n => n.type === 'claim' && !targetIds.has(n.id));
            mainClaimId = potentialRoots.length > 0 ? potentialRoots[0].id : data.nodes[0]?.id;
        }

        // 2. Group edges by source to easily find children
        const edgesByTarget = new Map<string, ArgumentEdge[]>();
        data.edges.forEach(e => {
            const list = edgesByTarget.get(e.target) || [];
            list.push(e);
            edgesByTarget.set(e.target, list);
        });

        // 3. Recursive Layout Function
        // This is a simplified hierarchical layout centered on the main claim
        const calculatePositions = () => {
            // Place Main Claim at Center
            const centerX = width / 2;
            const centerY = height / 2;

            const mainNode = data.nodes.find(n => n.id === mainClaimId);
            if (mainNode) {
                positions.set(mainClaimId!, { x: centerX, y: centerY });
            }

            // Helper to place children
            // direction: -1 for above (support), 1 for below (attack)
            const placeChildren = (parentId: string, parentPos: Position) => {
                const incomingEdges = edgesByTarget.get(parentId) || [];

                const supports = incomingEdges.filter(e => e.type === 'supports');
                const attacks = incomingEdges.filter(e => e.type === 'attacks' || e.type === 'rebuts');
                const alternatives = incomingEdges.filter(e => e.type === 'is-alternative-to');

                // Place Supports (Above)
                if (supports.length > 0) {
                    const totalWidth = supports.length * (NODE_WIDTH + NODE_SPACING) - NODE_SPACING;
                    let startX = parentPos.x - totalWidth / 2 + NODE_WIDTH / 2;

                    supports.forEach((edge, index) => {
                        const childId = edge.source;
                        if (!positions.has(childId)) {
                            positions.set(childId, {
                                x: startX + index * (NODE_WIDTH + NODE_SPACING),
                                y: parentPos.y - LAYER_HEIGHT
                            });
                            // Recurse
                            placeChildren(childId, positions.get(childId)!);
                        }
                    });
                }

                // Place Attacks (Below)
                if (attacks.length > 0) {
                    const totalWidth = attacks.length * (NODE_WIDTH + NODE_SPACING) - NODE_SPACING;
                    let startX = parentPos.x - totalWidth / 2 + NODE_WIDTH / 2;

                    attacks.forEach((edge, index) => {
                        const childId = edge.source;
                        if (!positions.has(childId)) {
                            positions.set(childId, {
                                x: startX + index * (NODE_WIDTH + NODE_SPACING),
                                y: parentPos.y + LAYER_HEIGHT
                            });
                            // Recurse
                            placeChildren(childId, positions.get(childId)!);
                        }
                    });
                }

                // Place Alternatives (Right side for now)
                if (alternatives.length > 0) {
                    alternatives.forEach((edge, index) => {
                        const childId = edge.source;
                        if (!positions.has(childId)) {
                            positions.set(childId, {
                                x: parentPos.x + (NODE_WIDTH + NODE_SPACING) * (index + 1),
                                y: parentPos.y
                            });
                        }
                    });
                }
            };

            if (mainClaimId && positions.has(mainClaimId)) {
                placeChildren(mainClaimId, positions.get(mainClaimId)!);
            }

            // Handle disconnected nodes (fallback)
            let disconnectedCount = 0;
            data.nodes.forEach(node => {
                if (!positions.has(node.id)) {
                    // meaningful fallback position?
                    positions.set(node.id, {
                        x: 50 + disconnectedCount * 20,
                        y: 50 + disconnectedCount * 20
                    });
                    disconnectedCount++;
                }
            });
        };

        calculatePositions();

        // Combine data
        const finalNodes = data.nodes.map(node => ({
            ...node,
            ...(positions.get(node.id) || { x: 0, y: 0 })
        }));

        return {
            nodes: finalNodes,
            edges: data.edges,
            width,
            height
        };
    }, [data, width, height]);
}
