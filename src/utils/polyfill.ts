import { useHistory, useLocation } from 'react-router-dom';

export function useNavigate() {
  const history = useHistory();

  return (to: any, options?: { replace: boolean }) => {
    if (typeof to === 'number') {
      history.go(to);
    } else if (options?.replace) {
      history.replace(to);
    } else {
      history.push(to);
    }
  };
}

export function useSearchParams() {
  const { search } = useLocation();
  const history = useHistory();

  const searchParams = new URLSearchParams(search);

  const setSearchParams = newParams => {
    const newSearchParams = new URLSearchParams(newParams);
    history.push({ search: newSearchParams.toString() });
  };

  return [searchParams, setSearchParams];
}
