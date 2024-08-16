import './index.less'
import { Skeleton } from 'antd';
const SkeletonCard = () => {
  return (
    <div className='skeleton-list'>
      <div className='skeleton-card'>
        <div className='skeleton-card-top'>
          <Skeleton.Avatar active size='small' style={{width: 24, minWidth: 24, height: 24}} />
        </div>
        <div className='skeleton-card-buttom'>
          <div>
            <Skeleton.Input active size='small' style={{width: 100, minWidth: 100, height: 16, marginTop: 8}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
