

import { useEffect } from 'react';
import axios from 'axios';

import Header from './components/Header';
import Body from './components/Body';
import Footer from './components/Footer';


const App = () => {
  useEffect(() => {
      // console.log(`yerr`)
  }, []);
  return (
    <>
    <Header />
    <Body />
    <Footer />
    </>
  );
}

export default App