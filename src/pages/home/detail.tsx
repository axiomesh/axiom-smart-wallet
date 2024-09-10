import React, {useEffect, useState} from "react";
import styles from './index.less';
import { Flex } from '@chakra-ui/react'
import {connect} from "umi";
import Page from '@/components/Page';
import nftBg from '@/assets/nft-bg.png';
import ButtonPro from "@/components/Button";
import MainTag from '@/components/Tag/main';
import {Popover} from "antd";
import {getNftDetail} from "@/services/login";
import {exchangeAddress, getQueryParam} from "@/utils/help";

const NftDetail = (props:any) => {
    const [info, setInfo] = useState({});
    const handleUrlClick = () => {
        // const params = getQueryParam('id');
        // window.open(`${window.AXM_BROWSER}/token/${info?.token?.address}/instance/${params}`)
        window.open(`${window.AXM_BROWSER}/token/${info?.token?.address}`)
    }

    const getInfo = async () => {
        const params = getQueryParam('id');
        const type = getQueryParam('type');
        const addr = type === 'ERC-721' ? window.NFT_CONTRACT_721 : window.NFT_CONTRACT_1155;
        const res = await getNftDetail(addr, params);
        setInfo(res);
    }

    useEffect(() => {
        getInfo();
    }, []);
    return (
        <Page needBack>
            <Flex gap='40px' className={styles.topDetail}>
                <img src={info.image_url || nftBg} width={400} alt=""/>
                <div>
                    <Popover
                        // placement="top"
                        // title={null}
                        content={<div className='bottom-title-popover'>Enter the odyssey</div>}
                        arrow={false}
                        mouseEnterDelay={1}
                        overlayInnerStyle={{borderRadius: 8, padding: '12px 20px', maxWidth: 400, fontWeight:500, fontSize: 14, color: '#2D3748'}}
                    >
                        <div className={styles.rightDetailTitle}># {info.id}</div>
                    </Popover>
                    <Popover
                        // placement="top"
                        // title={null}
                        content={<div className='bottom-title-popover'>{info?.token?.name}</div>}
                        arrow={false}
                        mouseEnterDelay={1}
                        overlayInnerStyle={{borderRadius: 8, padding: '12px 20px', maxWidth: 400, fontWeight:500, fontSize: 14, color: '#2D3748'}}
                    >
                        <div className={styles.rightDetailDesc}>{info?.token?.name}</div>
                    </Popover>


                    <div style={{margin: '32px 0'}}>
                        <div className={styles.rightDetailDesc}>Contract Address</div>
                        <MainTag text={exchangeAddress(info?.token?.address)} onClick={handleUrlClick} />
                    </div>
                    <div>
                        <ButtonPro isDisabled={true} style={{height: 56,width: 320}}>Transfer</ButtonPro>
                    </div>
                </div>
            </Flex>
            <div className={styles.bottomDetail}>
                <div className={styles.bottomDetailTitle}>Details</div>
                <div className={styles.bottomDetailBody}>
                    <Flex>
                        <div className={styles.label}>Chain</div>
                        <div className={styles.value}>{window.localChain}</div>
                    </Flex>
                    <Flex>
                        <div className={styles.label}>Token ID</div>
                        <div className={styles.value}>{info.id}</div>
                    </Flex>
                    <Flex>
                        <div className={styles.label}>Token Standard</div>
                        <div className={styles.value}>{info?.token?.type}</div>
                    </Flex>
                    {/*<Flex>*/}
                    {/*    <div className={`${styles.label} ${styles.last}`}>Last updated</div>*/}
                    {/*    <div className={`${styles.value} ${styles.last}`}>{dayjs(new Date().getTime()).format('llll')}</div>*/}
                    {/*</Flex>*/}
                </div>
            </div>
        </Page>
    )
}

// export default NftDetail;
export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(NftDetail)
