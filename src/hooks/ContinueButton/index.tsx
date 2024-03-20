import React, { useState } from 'react';
import styles from './index.less'

interface ButtonHook {
    Button: React.FC<{ onClick: () => void }>;
}

function useContinueButton(initialState = false): ButtonHook {

    const Button: React.FC<{ onClick: () => void }> = ({ children, onClick }) => (
        <div className={styles.button} onClick={() => { onClick();}}>
            {children}
        </div>
    );

    return { Button };
}

export default useContinueButton;
