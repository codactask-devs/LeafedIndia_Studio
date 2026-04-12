import React from 'react';
import useStore from '../store/useStore';
import "./Toolbar.css";
import { Undo, Redo, Mail, Save, List, HelpCircle } from 'lucide-react';
import companylogo from "./../assets/LEAFEDINDIA Logo.svg"
import mobileLogo from "./../assets/LEAFEDINDIA Logo2.svg"

const Toolbar = ({ onExport, onSave, onToggleSavedList, onStartTour }) => {
    const { undo, redo, history, historyStep, savedDesigns, hasChanges, objects } = useStore();

    const canUndo = historyStep > 0;
    const canRedo = historyStep < history.length - 1;

    // Only count the current design if it has changes AND has actual objects on canvas
    const currentDesignCount = (hasChanges && objects.length > 0) ? 1 : 0;
    const totalCount = savedDesigns.length + currentDesignCount;

    return (
        <div className="toolbar-container">
        <div id="toolbar-logo" data-tour="toolbar-logo" className="toolbar-logo">
          <picture>
            <source media="(max-width: 768px)" srcSet={mobileLogo} />
            <img 
              src={companylogo} 
              alt='LeafedIndia Studio Logo' 
              className="logo-img"
            />
          </picture>
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
                    data-tour="save-btn"
                    className={`btn ${hasChanges ? "btn-success1" : "btn-outline-success1"} toolbar-save-btn`}
                    onClick={onSave}
                    title="Save current design"
                >
                    <Save size={18} />
                    <span>{hasChanges ? "Save Changes" : "Save"}</span>
                </button>

                <button data-tour="export-btn" className="btn toolbar-export-btn" onClick={onExport}>
                    <Mail size={18} />
                    <span>Email Design ({totalCount})</span>
                </button>

                <button
                    data-tour="help-btn"
                    className="btn btn-help toolbar-help-btn"
                    onClick={onStartTour}
                    title="Start guided tour"
                >
                    <HelpCircle size={18} />
                    <span>Need Help?</span>
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
