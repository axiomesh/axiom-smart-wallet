import styles from "./index.less";
import React, { useState, useEffect } from "react";
import Page from '@/components/Page';
import { history, connect } from 'umi';
import {getDeviceList, passkeySecurityInfo} from "@/services/transfer";
import {getMail, getVisitorId} from "@/utils/help";
import { convertTimestampToDate } from "@/utils/utils";
import Toast from "@/hooks/Toast";
import {
    MacIcon,
    WindowsIcon,
    SelectDownIcon,
    DeviceIcon,
    ActiveDeviceIcon,
    EdgeIcon,
    OperaIcon, ChromeIcon, SafariIcon, GlobeIcon, PhoneIcon, ComputerIcon, FirefoxIcon
} from "@/components/Icons";
import ButtonPro from "@/components/Button";
import AddDeviceModal from './componments/add';
import RemoveDeviceModal from "@/pages/passkey-security/componments/remove";
import dayjs from "dayjs";
import {Tooltip} from "antd";

const tabList = ['Passkey', 'Device'];
const passkeySecurity = (props: any) => {
    const email: string | any = getMail();
    const deviceId = getVisitorId();
    const { userInfo } = props;
    const [passkeyInfo, setPasskeyInfo] = useState<any>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [openList, setOpenList] = useState([0]);
    const [addOpen, setAddOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [devices, setDevices] = useState<any>([]);
    const [deviceInfo, setDeviceInfo] = useState({});
    const {showErrorToast} = Toast();

    const getList = async () => {
        const list = await getDeviceList({email: email, device_id: deviceId});
        setDevices(list);
    }

    useEffect(() => {
        handleGetPasskeyInfo();
        getList();
    }, [])

    const handleGetPasskeyInfo = (async () => {
        try {
            const result = await passkeySecurityInfo({email: email, device_id: deviceId});
            setPasskeyInfo(result);
        }catch (error: any) {
            showErrorToast(error);
        }
    })

    const handleGetTipList = () => {
        return [
            "Safari on MacOS",
            "Chrome on MacOS",
            "Opera on Windows"
        ]
    }

    const handleTabChange = (i: number) => {
        setActiveTab(i);
    }

    const handleOpen = (i: number) => {
        // setOpenList(true)
        if(openList.includes(i)){
            const newList = openList.filter(item => item !== i);
            setOpenList(newList)
        } else {
            setOpenList([...openList, i])
        }
    }

    const getBrowserIcon = (type) => {
        switch (type) {
            case 3:
                return <EdgeIcon style={{width: 40, height: 40}} />;
            case 4:
                return <OperaIcon style={{width: 40, height: 40}} />;
            case 2:
                return <ChromeIcon style={{width: 40, height: 40}} />;
            case 1:
                return <SafariIcon style={{width: 40, height: 40}} />;
            case 5:
                return <FirefoxIcon style={{width: 40, height: 40}} />;
            default:
                return <GlobeIcon style={{width: 40, height: 40}} />
        }
    };

    // addTrustDevice

    const handleAdd = async (device_id) => {
        // await addTrustDevice({email, device_id});
        setAddOpen(true);
    }

    const handleCancel = (item) => {
        setRemoveOpen(true)
        setDeviceInfo(item);
    }

    return (
        <Page needBack backFn={() => history.push('/security')}>
            <div>
                <h1 className='page-title' style={{marginTop: "20px"}}>Passkey Security</h1>
                <p className={styles.passkeyTip}>Your passkey information display here</p>
                <div style={{display: 'flex', margin: '20px 0'}}>
                    <div className={styles.tabList}>
                        {tabList.map((item, index) => (
                            <div
                                key={item}
                                className={activeTab === index ? 'tab-active' : 'tab'}
                                onClick={() => handleTabChange(index)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    {activeTab === 0 ? <div className={styles.passkeyContent}>
                        {
                            passkeyInfo.map((item: any, index: number) => {
                                return (
                                    <div className={styles.passkeyItem} key={index}>
                                        <div className={styles.passkeyItemTop}>
                                            <img src={require(`@/assets/passkey/${item.device_type}.png`)} alt="" />
                                            <div className={styles.passkeyItemTopRight}>
                                                <p>Key {convertTimestampToDate(item.active_time)}</p>
                                                <div className={styles.passkeyItemTopRightBtn}>
                                                    <div className={styles.passkeyItemTopRightBtnLeft}>Passkey</div>
                                                    <div className={styles.passkeyItemTopRightBtnRight}>{item.device_type === "Mac" || item.device_type === "Windows" ? "Seen from this device" : "From trusted phone"}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.passkeyItemTip}>
                                            <img src={require("@/assets/passkey/safe.png")} alt="" />
                                            <span>Your passkey is protected by biometrics and can never be obtained by Google, iCloud, or AxiomWallet</span>
                                        </div>
                                        <div className={styles.passkeyItemBottom}>
                                            <div className={styles.passkeyItemBottomTitle}>Supported device</div>
                                            <div className={styles.passkeyItemBottomTip}>Where you can log in current account with Passkey</div>
                                            <div className={styles.passkeyItemBottomContent}>
                                                {
                                                    handleGetTipList().map((tip: string, tipIndex: number) => {
                                                        return (
                                                            <div key={tipIndex} className={styles.passkeyItemBottomContentItem}>{item.device_type === "Mac" || item.device_type === "Windows" ? <img src={require("@/assets/passkey/pc.png")} alt="" /> : <img src={require("@/assets/passkey/phone.png")} alt="" />}<span>{tip}</span></div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div> : <>
                    {devices.map((item, index) => <div>
                        <div className={openList.includes(index) ? "collapse-container active" : "collapse-container"}>
                            <div className="collapse-label">
                                <div className="collapse-label-left">
                                    <div className={styles.collapseLabelIcon}>
                                        {item?.device_name?.toLowerCase()?.includes('mac') ? <MacIcon /> : <WindowsIcon />}
                                    </div>
                                    <div>
                                        <div>
                                            <span style={{color: '#000', fontSize: 16, fontWeight: 600, marginRight: 8}}>{item.device_name}</span>
                                            {item.is_trusted_device === 1  ?<Tooltip title='Support account login using this trusted device’s passkey.'>
                                                <ActiveDeviceIcon />
                                            </Tooltip> : <Tooltip title='Add the current device as a trusted device and log in to your account using the local Passkey.'><DeviceIcon /></Tooltip>}
                                        </div>
                                        <div style={{color: '#718096', fontSize: 14}}>{item.device_version}</div>
                                    </div>
                                </div>
                                <div className="collapse-label-right">
                                    <div>
                                        {item.is_trusted_device === 1  ? <ButtonPro style={{paddingLeft: 27,paddingRight: 27, height: 48}} onClick={() => handleCancel(item)}>Deauthorize</ButtonPro> :
                                            item.is_current_device && item.is_trusted_device !== 1 ? <ButtonPro onClick={() => handleAdd(item.device_id)} style={{paddingLeft: 27,paddingRight: 27, height: 48}}>Authorize</ButtonPro> : null}
                                    </div>
                                    <div className='collapse_down_icon' onClick={() => handleOpen(index)}>
                                        <SelectDownIcon  />
                                    </div>
                                </div>
                            </div>
                            <div className="collapse-content">
                                <div style={{marginBottom: 20, color: '#718096', fontSize: 14}}>Recently used</div>
                                {
                                    (item.usage_records || []).map((li,index) =>  <div className={styles.browserItem} style={{marginBottom: index === item.usage_records.length - 1 ? 0 : 20}}>
                                        {getBrowserIcon(li.browser_type)}
                                        <div>
                                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                                {li.transport_type ? <ComputerIcon /> : <PhoneIcon />}
                                                <span style={{color: '#000', fontSize: 16, fontWeight: 600}}>Key {dayjs(li.active_time).format('YYYY-MM-DD HH:mm:ss')}</span>
                                                <div>{li.live_now ? <span className={styles.successTag}>Live Now</span> :li?.last_used ? <span className={styles.warnTag}>Last used</span> : null}</div>
                                            </div>
                                            <div style={{color: '#718096', fontSize: 14}}>{dayjs(li.last_login_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                                        </div>
                                    </div>)
                                }
                            </div>
                        </div>
                    </div>)}
                    </>}
                </div>
            </div>
            <AddDeviceModal loadData={getList} isOpen={addOpen} onClose={() => setAddOpen(false)} />
            <RemoveDeviceModal loadData={getList} isOpen={removeOpen} onClose={() => setRemoveOpen(false)} info={deviceInfo}></RemoveDeviceModal>
        </Page>
    )
};

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(passkeySecurity)
