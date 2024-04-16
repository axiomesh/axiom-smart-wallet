import React, { useState } from 'react';
import styles from './index.less'

interface ButtonHook {
    Button: React.FC<{ onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void, disabled: boolean }>;
}

function useContinueButton(initialState = false): ButtonHook {

    const Button: React.FC<{ onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void, disabled: boolean }> = ({ children, onClick, onMouseEnter, onMouseLeave, disabled }) => (
        <div className={`${styles.button} ${disabled && styles.buttonDisabled}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {children}
        </div>
    );

    return { Button };
}

export default useContinueButton;
