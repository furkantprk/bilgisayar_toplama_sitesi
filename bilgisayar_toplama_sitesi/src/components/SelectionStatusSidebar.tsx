
import React from 'react';
import './SelectionStatusSidebar.css';

interface Step {
    key: string;
    label: string;
    ref: React.RefObject<HTMLDivElement | null>;
    selected: boolean;
    enabled: boolean;
}

interface SelectionStatusSidebarProps {
    steps: Step[];
}

const SelectionStatusSidebar: React.FC<SelectionStatusSidebarProps> = ({ steps }) => {

    const handleScrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref?.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <div className="status-sidebar">
            <h3>Sistem Özeti</h3>
            <ul className="status-list">
                {steps.map((step) => (
                    <li
                        key={step.key}
                        className={`
                            status-item
                            ${step.selected ? 'status-selected' : 'status-pending'}
                            ${!step.enabled ? 'status-disabled' : ''}
                        `}
                        onClick={() => step.enabled && handleScrollTo(step.ref)}
                    >
                        <span className="status-icon">
                            {step.selected ? '✓' : '✗'}
                        </span>
                        <span className="status-label">{step.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SelectionStatusSidebar;