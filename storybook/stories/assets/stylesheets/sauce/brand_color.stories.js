// shamelessly stolen (mostly) from:
// https://benrobertson.io/frontend/color-swatches-storybook
import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import colors from 'assets/stylesheets/sauce/brand/_color.scss';

const filterGroup = (filter) =>
  Object.keys(colors).filter((color) => color.indexOf(filter) === 0);

/*
  When you have defined your colours in src/assets/stylesheets/sauce/brand/_color.scss
  add the details for 'group' that is exported from // Webpack exports in here
  The group name matches the exported object, the name / title are for presentation
*/
const groups = [
  { name: 'Brand', title: 'Brand colours', group: 'brand' },
  { name: 'Red', title: 'Red shades', group: 'red' },
  { name: 'Blue', title: 'Blue shades', group: 'blue' },
  { name: 'Navy', title: 'Navy blue shades', group: 'navy' },
  { name: 'Orange', title: 'Orange shades', group: 'orange' },
  { name: 'Yellow', title: 'Yellow shades', group: 'yellow' },
  { name: 'Purple', title: 'Purple shades', group: 'purple' },
  { name: 'Green', title: 'Green shades', group: 'green' },
  { name: 'Teal', title: 'Teal shades', group: 'teal' },
  { name: 'Grey', title: 'Grey shades', group: 'grey' },
]
groups.forEach(({ name: groupName, title, group }) => {
  storiesOf('Sauce/Colours', module).add(groupName, () => (
    <div style={{ padding: '20px' }}>
      <>
        <h3>{title}</h3>
        <ColorGroup group={filterGroup(group)} />
      </>
    </div>
  ));
})


// Convert the color key to the color variable name.
const colorVariable = (color) => {
  const array = color.split('-').slice(1);
  return `$${array.join('-').toLowerCase()}`;
};

// Convert the color key to the color proper name.
const colorName = (color) => {
  const array = color.split('-')[1].split(/(?=[A-Z])/);
  return `${array.join(' ').toLowerCase()}`;
};

// A component for displaying individual color swatches.
const Color = ({ color }) => (
  <li
    style={{
      borderRadius: '5px',
      border: '1px solid lightgray',
      padding: '5px'
    }}
  >
    <span
      style={{
        backgroundColor: colors[color],
        display: 'block',
        height: '4em',
        marginBottom: '0.3em',
        borderRadius: '5px',
        border: '1px solid lightgray'
      }}
    />
    <span style={{ textTransform: 'capitalize' }}>{colorName(color)}</span>{' '}
    <br />
    <span>{colorVariable(color)}</span> <br />
    <span>{colors[color]}</span> <br />
  </li>
);

Color.propTypes = {
  color: PropTypes.string.isRequired
};

// A component for displaying a group of colors.
const ColorGroup = ({ group }) => (
  <ul
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 175px))',
      gridGap: '20px',
      marginBottom: '40px'
    }}
  >
    {group.map((color) => {
      return <Color color={color} key={color} />;
    })}
  </ul>
);

ColorGroup.propTypes = {
  group: PropTypes.array.isRequired
};
