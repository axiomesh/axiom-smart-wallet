import Pagination from 'rc-pagination';
import React from "react";
import './index.less';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon, ArrowLeftIcon } from '@chakra-ui/icons';

export default function PaginationPro (props: any) {
    return <Pagination
        prevIcon={
            <button className='rc-pagination-item-link' type="button" tabIndex={-1}>
                <ChevronLeftIcon fontSize="24px" />
            </button>
        }
        nextIcon={<button className='rc-pagination-item-link' type="button" tabIndex={-1}>
            <ChevronRightIcon fontSize="24px" />
        </button>}
        jumpPrevIcon={
            <a className='rc-pagination--item-link'>
                <div className='rc-pagination-item-container'>
                    <ArrowLeftIcon className='rc-pagination-item-link-icon' />
                    <span className='rc-pagination-item-ellipsis'>•••</span>
                </div>
            </a>
        }
        jumpNextIcon={
            <a className='rc-pagination--item-link'>
                <div className='rc-pagination-item-container'>
                    <ArrowRightIcon className='rc-pagination-item-link-icon' />
                    <span className='rc-pagination-item-ellipsis'>•••</span>
                </div>
            </a>
        }
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        showQuickJumper
        {...props} total={5000} />
}
