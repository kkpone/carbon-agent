import style from '../index.module.less';

type IconProps = {
  className?: string;
  src: string;
};

const Icon = ({ className = style.navIcon, src }: IconProps) => (
  <img aria-hidden='true' alt='' className={className} src={src} />
);

export default Icon;
