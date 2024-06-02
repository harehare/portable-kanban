import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { CheckBox } from '../components/shared/CheckBox';
import { TextBaseBold } from '../components/shared/Text';
import { type Settings } from '../models/kanban';
import { actions, selectors } from '../store';

const Overlay = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1);
  top: 0;
`;

const Container = styled.div`
  position: absolute;
  right: 0;
  top: var(--header-height);
  color: var(--text-color);
  background-color: var(--primary-background-color);
  width: 192px;
  height: calc(100vh - var(--header-height));
  padding: 16px;
  overflow-y: scroll;
`;

const LabelItem = styled.div`
  width: 100%;
  max-width: 140px;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--light-text-color);
  border-radius: var(--border-radius);
  margin-right: 4px;
  font-weight: 600;
  padding: 4px 8px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

type Properties = {
  settings: Settings;
};

export const Filter = ({ settings }: Properties) => {
  const filteredText = selectors.useFilterText();
  const filteredLabels = selectors.useFilterLabels();
  const setFilter = actions.useSetFilter();
  const navigate = useNavigate();

  return (
    <Overlay
      onClick={() => {
        navigate('/');
      }}
    >
      <Container
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
        }}
      >
        <div style={{ width: '100%', padding: '8px', textAlign: 'center' }}>
          <TextBaseBold>Filter Cards</TextBaseBold>
        </div>
        {settings.labels.map((label) => (
          <div
            key={label.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <CheckBox
                checked={Boolean(filteredLabels.has(label.title))}
                onChange={() => {
                  if (filteredLabels.has(label.title)) {
                    setFilter(filteredText, new Set([...filteredLabels].filter((l) => l !== label.title)));
                  } else {
                    setFilter(filteredText, new Set([...filteredLabels, label.title]));
                  }
                }}
              />
            </div>
            <LabelItem
              style={{ backgroundColor: label.color }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                if (filteredLabels.has(label.title)) {
                  setFilter(filteredText, new Set([...filteredLabels].filter((l) => l !== label.title)));
                } else {
                  setFilter(filteredText, new Set([...filteredLabels, label.title]));
                }
              }}
            >
              {label.title}
            </LabelItem>
          </div>
        ))}
      </Container>
    </Overlay>
  );
};
