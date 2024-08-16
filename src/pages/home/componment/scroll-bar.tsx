import React, { useState, useEffect } from 'react';
import SkeletonCard from './skeleton-card';
import './index.less';

const ScrollLoader = ({ current, num, loadMore, hasMore, firstLoading }) => {
  const [loading, setLoading] = useState(false);

  const handleScroll = () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    const scrollH = document.body.scrollHeight;
    const clientH = document.body.clientHeight
    if ((scrollH - scrollTop <= clientH + 1) && !loading && hasMore) {
      setLoading(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    if (loading && hasMore) {
      loadMore(current + 1).then(() => setLoading(false));
    }
  }, [loading, hasMore]);

  return (
    <div>
      {/* Your content goes here */}
      {loading && <div className='dapp-list'>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      {num === 4 ? <SkeletonCard /> : null}
      </div>}
      {!loading && !hasMore && !firstLoading ? <div className='no-more'>no more NFTs</div> : null}
    </div>
  );
};

export default ScrollLoader;
