import { getSmoothStepPath, type EdgeProps } from '@xyflow/react'

export function ConveyorEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  })

  return (
    <g>
      {/* outer chassis — thick dark track */}
      <path
        id={`${id}-chassis`}
        d={edgePath}
        fill="none"
        stroke="#0a0909"
        strokeWidth={10}
        className="react-flow__edge-path"
      />
      {/* belt surface */}
      <path d={edgePath} fill="none" stroke="#2d2820" strokeWidth={6} />
      {/* animated flow chevrons */}
      <path
        d={edgePath}
        fill="none"
        stroke="#c9a030"
        strokeWidth={2.5}
        strokeDasharray="8 12"
        style={{ animation: 'conveyorFlow 1.1s linear infinite' }}
        opacity={0.8}
      />
    </g>
  )
}
