import React from 'react';
import useStore from '../store/useStore';
import "./Toolbar.css";
import { Undo, Redo, Mail, Save, List } from 'lucide-react';

const Toolbar = ({ onExport, onSave, onToggleSavedList }) => {
    const { undo, redo, history, historyStep, savedDesigns, hasChanges, objects } = useStore();

    const canUndo = historyStep > 0;
    const canRedo = historyStep < history.length - 1;

    // Only count the current design if it has changes AND has actual objects on canvas
    const currentDesignCount = (hasChanges && objects.length > 0) ? 1 : 0;
    const totalCount = savedDesigns.length + currentDesignCount;

    return (
        <div className="toolbar-container">
            <div className="toolbar-logo">
                LeafedIndia Studio
            </div>

            <div className="toolbar-actions-wrapper">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="toolbar-icon-btn"
                    title="Undo Changes"
                >
                    <Undo size={18} />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="toolbar-icon-btn"
                    title="Redo Changes"
                >
                    <Redo size={18} />
                </button>
            </div>

            <div className="toolbar-right-actions">
                {savedDesigns.length > 0 && (
                    <button
                        className="btn btn-outline-secondary toolbar-saved-list-btn"
                        onClick={onToggleSavedList}
                        title="View Saved Attachments"
                    >
                        <List size={18} />
                        <span>Attachments ({savedDesigns.length})</span>
                    </button>
                )}

                <button
                    className={`btn ${hasChanges ? "btn-success" : "btn-outline-success"} toolbar-save-btn`}
                    onClick={onSave}
                    title="Save current design"
                >
                    <Save size={18} />
                    <span>{hasChanges ? "Save Changes" : "Save"}</span>
                </button>

                <button className="btn btn-primary toolbar-export-btn" onClick={onExport}>
                    <Mail size={18} />
                    <span>Email Design ({totalCount})</span>
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
