import React from 'react';
import TurnManager, { TurnPhase } from '../TurnManager';
import { LogEntry } from '../log/LogPanel';

interface TurnTabProps {
  turn: number;
  phase: TurnPhase;
  onEndTurn: () => void;
  events: LogEntry[];
}

export default function TurnTab({
  turn,
  phase,
  onEndTurn,
  events
}: TurnTabProps) {
  return (
    <TurnManager 
      turn={turn}
      phase={phase}
      onEndTurn={onEndTurn}
      events={events}
    />
  );
} 