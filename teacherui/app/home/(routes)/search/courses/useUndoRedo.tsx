import { useState } from "react";

function useUndoRedo<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const [undoStack, setUndoStack] = useState<T[]>([]);
  const [redoStack, setRedoStack] = useState<T[]>([]);

  const setDocument = (newState: T) => {
    setUndoStack((prev) => [...prev, state]);
    setRedoStack([]);
    setState(newState);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [state, ...prev]);
    setState(previousState);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setUndoStack((prev) => [...prev, state]);
    setState(nextState);
  };

  return { state, setDocument, undo, redo };
}

export default useUndoRedo;
