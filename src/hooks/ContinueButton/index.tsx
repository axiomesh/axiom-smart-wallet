import React, { useState } from 'react';
import styles from './index.less'

interface ButtonHook {
    Button: React.FC<{ onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void }>;
}

function useContinueButton(initialState = false): ButtonHook {

    const Button: React.FC<{ onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void }> = ({ children, onClick, onMouseEnter, onMouseLeave }) => (
        <div className={styles.button} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {children}
        </div>
    );

    return { Button };
}

export default useContinueButton;
