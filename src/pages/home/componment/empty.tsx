import './index.less'
import empty from '@/assets/no-data.png';

const Empty = (props) => {
  const { extra, title } = props;

  // const { name } = useModel('global');
  return (
    <div className='empty-container'>
      <div>
        <img width={150} src={empty} alt='empty' />
        <div  className='empty-title'>{title}</div>
        { extra ? <div className='empty-desc'>{extra}</div> : null}
      </div>
    </div>
  );
};

export default Empty;
