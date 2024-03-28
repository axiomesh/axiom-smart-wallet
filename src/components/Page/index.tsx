import React from 'react';
import { history } from "umi";
import { BackIcon } from '@/components/Icons';

type Props = {
    needBack?: boolean;
    children?: JSX.Element;
    backFn?: () => {};
};
const Page: React.FC<Props> = ({needBack, backFn, children}) => {

    const handleBack = () => {
        if(backFn) {
            backFn()
        } else {
            history.go(-1)
        }
    }
    return (
        <div style={{padding: 48,
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 700,
            height: '100vh',
            overflow: 'scroll',
            background: 'linear-gradient(0deg, #fff 0%, rgba(237, 205, 88, 0.01) 33%, rgba(236, 201, 75, 0) 66%, rgba(255, 255, 255, 0.8) 100%)'
        }}>
            { needBack ? <div onClick={handleBack} className='page-back'>
                <BackIcon />
                <span>Back</span>
            </div> : null}
            { children }
        </div>
    )
}

export  default Page;
