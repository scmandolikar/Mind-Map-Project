import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaCheck } from 'react-icons/fa';

const PRESETS = [
    '#ffffff', // White
    '#ffadad', // Red Light
    '#ffd6a5', // Orange Light
    '#fdffb6', // Yellow Light
    '#caffbf', // Green Light
    '#9bf6ff', // Cyan Light
    '#a0c4ff', // Blue Light
    '#bdb2ff', // Purple Light
    '#ffc6ff', // Pink Light
    '#ef4444', // Red Bold
    '#3b82f6', // Blue Bold
    '#10b981', // Green Bold
];

function EditNodeModal({ node, onClose, onSave, onDelete }) {
    const [label, setLabel] = useState(node.data.label || '');
    const [color, setColor] = useState(node.style?.backgroundColor || '#ffffff');

    useEffect(() => {
        if (node) {
            setLabel(node.data.label || '');
            setColor(node.style?.backgroundColor || '#ffffff');
        }
    }, [node]);

    const handleSave = () => {
        onSave(node.id, label, color);
        onClose();
    };

    const handleDelete = () => {
        onDelete(node.id);
        onClose();
    };

    if (!node) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Edit Node</h3>
                    <button className="icon-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="modal-body">
                    <label>Label</label>
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        autoFocus
                    />

                    <label>Color</label>
                    <div className="presets-container">
                        {PRESETS.map(preset => (
                            <div
                                key={preset}
                                className={`preset-swatch ${color === preset ? 'selected' : ''}`}
                                style={{ backgroundColor: preset }}
                                onClick={() => setColor(preset)}
                            />
                        ))}
                    </div>

                    <div className="color-picker-container">
                        <label style={{ marginBottom: 0, marginRight: '10px' }}>Custom:</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="color-input"
                        />
                        <span className="color-value">{color}</span>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-delete" onClick={handleDelete}>
                        <FaTrash /> Delete
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                        <FaCheck /> Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditNodeModal;
