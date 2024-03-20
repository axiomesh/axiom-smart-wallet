import styles from './index.less'
import { useState, useRef } from 'react';

const PIN_LENGTH = 6;
const KEYCODE = Object.freeze({
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    END: 35,
    HOME: 36,
    SPACE: 32,
});

const InputPassword = () => {
    const [value, setValue] =useState("");
    const inputRef = useRef();

    function handleClick(e) {
        e.preventDefault();
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    function handleChange(e) {
        const val = e.target.value || "";
        setValue(val);
    }

    // 处理一些键盘特殊按键，清除默认行为
    function handleOnKeyDown(e) {
        switch (e.keyCode) {
            case KEYCODE.LEFT_ARROW:
            case KEYCODE.RIGHT_ARROW:
            case KEYCODE.HOME:
            case KEYCODE.END:
            case KEYCODE.SPACE:
                e.preventDefault();
                break;
            default:
                break;
        }
    }

    return (
        <div className={styles.container}>
            <input
                ref={inputRef}
                className={"hiddenInput"}
                type="number"
                pattern="\d*"
                onChange={handleChange}
                onKeyDown={handleOnKeyDown}
                maxLength={PIN_LENGTH}
            />
            {Array.from({ length: PIN_LENGTH }).map((_, index) => {
                const focus =
                    index === value.length ||
                    (index === PIN_LENGTH - 1 && value.length === PIN_LENGTH);
                return (
                    <input
                        className={`${styles.pinInput} ${focus ? styles.fucos : ""}`}
                        key={index}
                        value={value[index] || ""}
                        onClick={handleClick}
                        readOnly={true}
                    />
                );
            })}
        </div>
    )
}

export default InputPassword;
