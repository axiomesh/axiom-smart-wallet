import styles from "./index.less";
import React from "react";

interface Props {
    onClick: () => void; // 函数没有参数，没有返回值
}

const Back = (props: Props) => {
    return (
        <div className={styles.back} onClick={props.onClick}>
            <img src={require("@/assets/reset/back.png")} alt=""/>
            <span>Back</span>
        </div>
    )
}

export default Back;
