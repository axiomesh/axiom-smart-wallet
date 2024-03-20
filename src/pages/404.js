import { withRouter } from 'umi';
import './404.less'

const NoFoundPage = () => {
  return <div className='page_404'>
    <div className='page_404_container'>
      <div>
        <img className='page_404_img' src='https://raw.githubusercontent.com/axiomesh/axiom-source/main/axiom-home-source/img/404_img.png' alt='404' />
        <div className='page_404_title'>Page not found</div>
      </div>
      <img className='page_404_insert1' src='https://raw.githubusercontent.com/axiomesh/axiom-source/main/axiom-home-source/img/404_insert1.png' alt='' />
      <img className='page_404_insert2' src='https://raw.githubusercontent.com/axiomesh/axiom-source/main/axiom-home-source/img/404_insert2.png' alt='' />
    </div>
  </div>
};

export default withRouter(NoFoundPage);
