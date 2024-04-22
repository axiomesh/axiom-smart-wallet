import React, { useState } from 'react';
import styles from './index.less'

interface ButtonHook {
    Button: React.FC<{ onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void, disabled: boolean, loading: boolean }>;
}

function useContinueButton(initialState = false): ButtonHook {

    const Button: React.FC<{ onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void, disabled: boolean, loading: boolean }> = ({ children, onClick, onMouseEnter, onMouseLeave, disabled, loading }) => (
        <div className={`${styles.button} ${disabled && styles.buttonDisabled} ${loading && styles.buttonLoading}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {children}
            {loading && <div className={styles.buttonLoadingIcon}></div>}
        </div>
    );

    return { Button };
}

export default useContinueButton;
