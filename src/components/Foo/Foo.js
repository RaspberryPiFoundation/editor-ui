import React from 'react';
import Style from 'style-it';
import styles from './Foo.css';

const Foo = (props) => {
  console.log(props)
  const { title } = props;

  const clickHandler = () => {

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
      </div>
    </Style>
  );
}

export default Foo
