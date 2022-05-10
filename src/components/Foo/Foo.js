import React from 'react';
import Style from 'style-it';
import styles from './Foo.css';
import { useSelector, useDispatch } from 'react-redux'
import { setFoo } from '../Editor/EditorSlice';

const Foo = (props) => {
  console.log(props)
  const dispatch = useDispatch();
  const menuItems = props.menuItems || []
  const { title  } = props;

  const clickHandler = () => {
    dispatch(setFoo('setting some data in redux'));

    const customEvent = new CustomEvent("custom", {
      bubbles: true,
      cancelable: false,
      composed: true
    });

    // This seems to be easiest way of firing an event on the web component
    const foo = document.querySelector('editor-wc')
    console.log('click event in react component')
    foo.dispatchEvent(customEvent)
  }

  return (
    <Style>
      {styles.toString()}
      <div className="App">
        <header className="App-header">
          <p className='foo'>
            <span onClick={clickHandler}>Wow {title}!</span>
          </p>
        </header>
        { menuItems.map((item, i) => (
          <div key={i}>
            Item: { item }
          </div>
        ))}
      </div>

    </Style>
  );
}

export default Foo
