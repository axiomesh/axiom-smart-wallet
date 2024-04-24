import logo from '@/assets/axiom.svg';
import './index.less';

export default function PrivacyAgreement(){
    return <div style={{padding: 80, color: "#2D3748"}}>
        <div style={{justifyContent: "center", marginBottom: 32, width: '100%', display: 'flex'}}>
            <img src={logo} alt='logo' width={80} height={80} />
        </div>
        <div>
            <div className='agree-title'>
                Privacy policy
            </div>
            <div className='agree-time'>
                <div className='agree-time-box'>
                    Last updated September 07, 2023
                </div>
            </div>
        </div>
        <div className='agreement-item'>
            <div className='agreement-item-title'>Overview</div>
            <div className='agreement-item-line-first'>
                Your privacy is important to us. Hangzhou Hyperchain Digital Finance Technology Co., Ltd. (“ Hyperchain Digital Finance”, “we”, or “us ”) wants you to be familiar with how we collect, use and disclose your Personal Information.
            </div>
            <div className='agreement-item-line'>
                This Privacy Policy (“Policy”) explains how we collect, use, and disclose your Personal Information when you visit or use service made available through our website:
            </div>
        </div>

    </div>
}
