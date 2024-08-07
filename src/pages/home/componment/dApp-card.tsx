import './index.less'
// import Tag from '@/components/Tag';
import React, { useState } from 'react';
import { history } from "umi";
import nftBg from '@/assets/nft-bg.png';
import eth from '@/assets/currency/eth/eth.png';
import axc from '@/assets/currency/axc/axc.png';
import { Popover } from 'antd';
const DAppCard = (props) => {
  const { isHome, item = {}, onClick } = props;
  const [isHover, setIsHover] = useState()

  // const { name } = useModel('global');
  const handleMouseOver = () => {
    setIsHover(true)
  }

  const handleMouseLeave = () => {
    setIsHover(false)
  }

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    history.push(`/nft-detail?id=${item?.id}`)
  }

  return (
    <div
      className='dapp-list-item'
      style={{marginBottom: isHome ? '40px' : '20px'}}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <img
          className={isHover ? 'dapp-list-item-bg dapp-list-item-bg-scale' : 'dapp-list-item-bg'}
          src={item.image_url || nftBg}
          alt='bg'
      />
      <div className='dapp-list-item-content'>
        <div className='dapp-list-item-bottom'>
          <div className='bottom-logo'>
            <img src={item.type=== 1 ? eth : axc} width={40} height={40} alt='logo' />
          </div>
          <div className='bottom-title'># {item.id}</div>

          <Popover
            placement="top"
            title={null}
            content={<div className='bottom-title-popover'>{item?.token?.name}</div>}
            arrow={false}
            mouseEnterDelay={1}
            overlayInnerStyle={{borderRadius: 8, padding: '12px 20px', maxWidth: 400, fontWeight:500, fontSize: 14, color: '#2D3748'}}
          >
            <div className='bottom-desc'>{item?.token?.name}</div>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default DAppCard;
