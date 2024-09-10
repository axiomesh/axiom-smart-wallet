import React, {useState, useEffect, useRef} from 'react';
import SkeletonCard from './skeleton-card';
import './index.less';
import DAppCard from "@/pages/home/componment/dApp-card";

const ScrollLoader = ({ current, loadMore, hasMore, firstLoading }) => {
  const [loading, setLoading] = useState(false);
  const [scrollT, setScrollTop] = useState(0);

  const handleScroll = () => {
    const ele = document.getElementById('outlet');
    let scrollTop = ele.scrollTop;
    const scrollH = ele.scrollHeight;
    const clientH = ele.clientHeight;

    if (scrollTop && (scrollH - scrollTop === clientH) && hasMore) {
      setScrollTop(scrollTop);
      setLoading(true)
    }
  };

  useEffect(() => {
    // window.addEventListener('scroll', handleScroll,true);
    // return () => window.removeEventListener('scroll', handleScroll, true);
    const root = document.getElementById('outlet')
    root.addEventListener('scroll', handleScroll, true);
    return () => root.removeEventListener('scroll', handleScroll, true);

  }, [current]);

  useEffect(() => {
    if (loading && hasMore) {
      loadMore(current + 1, scrollT).then(() => setLoading(false));
    }
  }, [loading, hasMore]);

  return (
    <div>
      {
        loading && current !== 1 ?  <div className='dapp-list'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div> : null
      }
      {!loading && !hasMore && !firstLoading ? <div className='no-more'>no more NFTs</div> : null}
    </div>
  );
};

export default ScrollLoader;
