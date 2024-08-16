import { Button } from 'antd';
import './index.less';

export default function AntdButton(props: any) {
  const { children, ...extra } = props;
  return (
    <Button {...extra} className="default_yellow_button" iconPosition="end">
      {children}
    </Button>
  );
}
