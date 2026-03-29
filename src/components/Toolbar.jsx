import React from 'react';
import { Undo, Redo, Mail } from 'lucide-react';
import useStore from '../store/useStore';
import "./Toolbar.css";

const Toolbar = ({ onExport }) => {
    const { undo, redo, history, historyStep } = useStore();

    const canUndo = historyStep > 0;
    const canRedo = historyStep < history.length - 1;

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

            <button className="btn btn-primary toolbar-export-btn" onClick={onExport}>
                <Mail size={18} />
                <span>Export & Email PDF</span>
            </button>
        </div>
    );
};

export default Toolbar;
