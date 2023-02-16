import * as React from 'react';
import { MdArchive, MdFilterAlt, MdMenu, MdSearch } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import LogoImage from '../assets/icon.svg';
import { actions, selectors } from '../store';
import { IconButton } from './shared/IconButton';
import { Input } from './shared/Input';
import { Menu } from './shared/Menu';
import { TextXs } from './shared/Text';

type Props = {
  title: string;
};

const Container = styled.div`
  width: 100vw;
  height: var(--header-height);
  display: flex;
  align-items: center;
  background-color: var(--header-color);
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Search = styled.div`
  position: relative;
  width: calc(100% - 120px);
  display: flex;
  align-items: center;
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-left: 24px;
`;

const Title = styled.div`
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--secondary-color);
  text-align: center;
`;

const Logo = styled.div`
  width: 32px;
  height: 32px;
  margin: 8px;
  object-fit: contain;
  padding-top: 8px;
`;

export const Header = ({ title }: Props) => {
  const setFilter = actions.useSetFilter();
  const searchLabels = selectors.useFilterLabels();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(searchInput, searchLabels);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <Container>
      <LogoContainer>
        <Logo>
          <LogoImage />
        </Logo>
        <Title>{title}</Title>
      </LogoContainer>
      <Search>
        <Icon>
          <MdSearch />
        </Icon>
        <Input
          style={{
            width: '100%',
            color: 'var(--secondary-color)',
            backgroundColor: 'transparent',
            marginRight: '48px',
            padding: '8px',
          }}
          value={searchInput}
          autoComplete="off"
          placeholder="Filter cards"
          onChange={(e) => {
            setSearchInput(e.target.value);
          }}
        />
      </Search>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        }}>
        <IconButton
          icon={<MdFilterAlt />}
          onClick={() => {
            navigate('/filters', { state: { backgroundLocation: location } });
          }}
        />
        {(searchLabels.size ?? 0) > 0 && (
          <TextXs style={{ marginBottom: '4px' }}>{searchLabels.size}</TextXs>
        )}
      </div>
      <div style={{ padding: '2px', paddingRight: '16px' }}>
        <Menu
          id={`main-menu`}
          position="left"
          icon={
            <div style={{ color: 'var(--light-text-color)' }}>
              <MdMenu />
            </div>
          }
          items={[
            {
              icon: <MdArchive />,
              text: 'Archived List',
              onClick: () => {
                navigate('/archive/lists', {
                  state: { backgroundLocation: location },
                });
              },
            },
            {
              icon: <MdArchive />,
              text: 'Archived cards',
              onClick: () => {
                navigate('/archive/cards', {
                  state: { backgroundLocation: location },
                });
              },
            },
          ]}
        />
      </div>
    </Container>
  );
};
